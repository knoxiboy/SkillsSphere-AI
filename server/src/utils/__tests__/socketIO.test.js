import assert from "node:assert/strict";
import test from "node:test";
import { setIO, getIO } from "../socketIO.js";

test("getIO returns undefined before setIO is called", () => {
  // Reset to clean state
  setIO(undefined);
  const instance = getIO();
  assert.equal(instance, undefined);
});

test("setIO stores the provided instance", () => {
  const mockIO = { id: "socket-server-instance" };
  setIO(mockIO);
  const instance = getIO();
  assert.equal(instance, mockIO);
  assert.equal(instance.id, "socket-server-instance");
});

test("getIO returns the stored instance after setIO", () => {
  const mockIO = { listeners: new Map(), connected: true };
  setIO(mockIO);
  const instance = getIO();
  assert.strictEqual(instance, mockIO);
});

test("setIO can replace the stored instance", () => {
  const firstIO = { id: 1 };
  const secondIO = { id: 2 };
  setIO(firstIO);
  assert.equal(getIO().id, 1);
  setIO(secondIO);
  assert.equal(getIO().id, 2);
});

test("setIO accepts null and getIO returns null", () => {
  setIO(null);
  const instance = getIO();
  assert.equal(instance, null);
});

test("setIO accepts false and getIO returns false", () => {
  const mockIO = false;
  setIO(mockIO);
  const instance = getIO();
  assert.equal(instance, false);
});
