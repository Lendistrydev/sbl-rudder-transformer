const { processWarehouseMessage } = require("../../../warehouse");

const snowflake = "snowflake";

function processSingleMessage(message, options) {
  return processWarehouseMessage(message, options);
}

function getDataTypeOverride(val, options) {}

function process(event) {
  const whSchemaVersion = event.request.query.whSchemaVersion || "v1";
  const whIDResolve = event.request.query.whIDResolve === "true" || false;
  const provider = snowflake;
  return processSingleMessage(event.message, {
    whSchemaVersion,
    whIDResolve,
    getDataTypeOverride,
    provider
  });
}

exports.process = process;
