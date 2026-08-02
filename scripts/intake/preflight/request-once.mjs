// Pinned HTTP transport (PHASE_004.md §4.2, §7.3, §8, §11). This is the
// ONLY module in the whole intake processor that opens a TCP connection.
// It never re-resolves DNS for the connection — a custom `lookup`
// callback forces the socket to the exact address `validate-destination.mjs`
// already classified as public, closing the DNS-rebinding window between
// "we checked" and "we connected" (§7.3). The original hostname is still
// used for the Host header and TLS SNI, so certificate validation is
// unaffected. After connect, `socket.remoteAddress` is compared against
// the pinned address again — belt-and-suspenders (§11): if `lookup`
// were ever bypassed by a future refactor, this second check still
// blocks.
import http from "node:http";
import https from "node:https";
import { REQUEST_HEADERS, TIMEOUTS_MS, MAX_BODY_BYTES } from "./constants.mjs";
import { NetworkTimeoutError, TlsError, DestinationBlockedError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";

function mapNodeError(err) {
  const tlsCodes = new Set(["CERT_HAS_EXPIRED", "ERR_TLS_CERT_ALTNAME_INVALID", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN", "CERT_UNTRUSTED"]);
  if (err.code === "CERT_HAS_EXPIRED") return new TlsError(PREFLIGHT_ERROR_CODES.TLS_EXPIRED_CERTIFICATE, err.message);
  if (err.code === "ERR_TLS_CERT_ALTNAME_INVALID") return new TlsError(PREFLIGHT_ERROR_CODES.TLS_HOSTNAME_MISMATCH, err.message);
  if (tlsCodes.has(err.code) || String(err.code ?? "").startsWith("ERR_TLS")) return new TlsError(PREFLIGHT_ERROR_CODES.TLS_CERTIFICATE_ERROR, err.message);
  return err;
}

// `url`/`hostname` come from parse-url.mjs (credentials/fragment already
// stripped). `pinnedAddress`/`family` come from validate-destination.mjs
// — the exact address this request is allowed to connect to, and no
// other. Resolves `{status, headers, body, bodyTruncated, remoteAddress}`
// or rejects with a PreflightError subclass (never a bare Node error —
// mapNodeError normalizes TLS errors; anything else surfaces as-is for
// the caller to classify as "unreachable").
export function requestOnce({ url, hostname, pinnedAddress, timeouts = TIMEOUTS_MS, maxBodyBytes = MAX_BODY_BYTES }) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https:");
    const transport = isHttps ? https : http;
    // §7.3 strategy 2: a custom lookup that ALWAYS returns the
    // pre-validated address — no second DNS resolution ever happens for
    // this connection, regardless of what a concurrent/later query
    // against the real resolver might return (DNS rebinding).
    const lookup = (_host, _options, callback) => callback(null, pinnedAddress.address, pinnedAddress.family);

    let settled = false;
    let bodyBytes = 0;
    const chunks = [];
    const timers = {};
    const clearTimers = () => Object.values(timers).forEach(clearTimeout);

    const failOnce = (err) => {
      if (settled) return;
      settled = true;
      clearTimers();
      req.destroy();
      reject(err);
    };
    const succeedOnce = (result) => {
      if (settled) return;
      settled = true;
      clearTimers();
      resolve(result);
    };

    const req = transport.request(url, {
      method: "GET",
      headers: REQUEST_HEADERS,
      lookup,
      agent: false, // §4.2: never inherit a shared/proxy-configured agent
      rejectUnauthorized: true, // §10: never disabled
      ...(isHttps ? { servername: hostname } : {}),
    });

    timers.total = setTimeout(() => failOnce(new NetworkTimeoutError(PREFLIGHT_ERROR_CODES.TOTAL_TIMEOUT_EXCEEDED, "total timeout exceeded")), timeouts.total);
    timers.connect = setTimeout(() => failOnce(new NetworkTimeoutError(PREFLIGHT_ERROR_CODES.CONNECT_TIMEOUT_EXCEEDED, "connect timeout exceeded")), timeouts.connect);

    req.on("socket", (socket) => {
      socket.once("connect", () => {
        clearTimeout(timers.connect);
        // §11: critical gate, not a warning — verified again here even
        // though `lookup` above already pins the address.
        const remoteAddress = socket.remoteAddress;
        const normalizedRemote = remoteAddress?.startsWith("::ffff:") ? remoteAddress.slice(7) : remoteAddress;
        if (normalizedRemote !== pinnedAddress.address) {
          failOnce(new DestinationBlockedError(PREFLIGHT_ERROR_CODES.REMOTE_ADDRESS_MISMATCH, `connected remote address ${remoteAddress} does not match pinned ${pinnedAddress.address}`));
          return;
        }
        timers.headers = setTimeout(() => failOnce(new NetworkTimeoutError(PREFLIGHT_ERROR_CODES.HEADERS_TIMEOUT_EXCEEDED, "headers timeout exceeded")), timeouts.headers);
      });
    });

    req.on("error", (err) => failOnce(mapNodeError(err)));

    req.on("response", (res) => {
      clearTimeout(timers.headers);
      timers.body = setTimeout(() => failOnce(new NetworkTimeoutError(PREFLIGHT_ERROR_CODES.BODY_TIMEOUT_EXCEEDED, "body timeout exceeded")), timeouts.body);

      res.on("data", (chunk) => {
        if (settled) return;
        bodyBytes += chunk.length;
        if (bodyBytes > maxBodyBytes) {
          const overshoot = bodyBytes - maxBodyBytes;
          chunks.push(chunk.subarray(0, chunk.length - overshoot));
          succeedOnce({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks), bodyTruncated: true, remoteAddress: pinnedAddress.address });
          res.destroy();
          return;
        }
        chunks.push(chunk);
      });
      res.on("end", () => {
        succeedOnce({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks), bodyTruncated: false, remoteAddress: pinnedAddress.address });
      });
      res.on("error", (err) => failOnce(mapNodeError(err)));
    });

    req.end();
  });
}
