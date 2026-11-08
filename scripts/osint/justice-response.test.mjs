// Testy převodu odpovědi Sbírky listin (lib/justice-response.mjs).
// Záruka: platná negativní JSON odpověď (HTTP 400) projde, HTML stránka
// firewallu skončí chybou s kódem, IČO a titulkem — ne holým SyntaxError,
// na kterém týdenní obnova archivu padala od 2026-09 bez vysvětlení.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURL_STATUS_ARGS, parseJusticeResponse, splitCurlOutput } from "./lib/justice-response.mjs";

const WAF = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'x'>\n<html><head><title>Service unavailable</title></head>"
  + "<body><div id='message'><h2>The request is blocked.</h2></div></body></html>";
const marker = (status, ct) => CURL_STATUS_ARGS[1].replace("%{http_code}", status).replace("%{content_type}", ct);

test("JSON projde, i s HTTP 400 (IČO bez subjektu je platná negativní odpověď)", () => {
  const out = `{"vysledek":"nenalezeno"}${marker("400", "application/json")}`;
  assert.deepEqual(parseJusticeResponse(splitCurlOutput(out), "12345678"), { vysledek: "nenalezeno" });
});

test("HTML stránka firewallu je srozumitelná chyba s kódem, IČO a titulkem", () => {
  const out = `${WAF}${marker("403", "text/html")}`;
  assert.throws(() => parseJusticeResponse(splitCurlOutput(out), "12345678"), (e) => {
    assert.match(e.message, /IČO 12345678/);
    assert.match(e.message, /HTTP 403/);
    assert.match(e.message, /Service unavailable — The request is blocked\./);
    assert.match(e.message, /nic nezapsalo/);
    assert.doesNotMatch(e.message, /SyntaxError|Unexpected token/);
    return true;
  });
});

test("jiný neparsovatelný obsah ukáže začátek těla", () => {
  assert.throws(() => parseJusticeResponse({ body: "Bad gateway", status: 502 }, "1"), /HTTP 502.*"Bad gateway"/);
});

test("výstup bez značky (starý curl) se nerozbije", () => {
  assert.deepEqual(splitCurlOutput('{"a":1}'), { body: '{"a":1}', status: null, contentType: "" });
});
