const genericPool = require("generic-pool");
const { getFactory } = require("./ivmFactory");
const logger = require("../logger");

const transformationPoolCache = {};
const transformationLibraryCache = {};
const opts = {
  min: 2, // minimum size of the pool
  max: 10 // maximum size of the pool
};

async function getPool(versionId, libraryVersionIds) {
  const sortedLibrariesIdString = libraryVersionIds.sort().toString();
  if (
    !transformationPoolCache[versionId] ||
    (transformationPoolCache[versionId] &&
      transformationLibraryCache[versionId] !== sortedLibrariesIdString)
  ) {
    if (transformationPoolCache[versionId]) {
      // draining resources
      transformationPoolCache[versionId].drain().then(function() {
        transformationPoolCache[versionId].clear();
      });
    }
    const factory = await getFactory(versionId, libraryVersionIds);
    transformationPoolCache[versionId] = genericPool.createPool(factory, opts);
    transformationLibraryCache[versionId] = sortedLibrariesIdString;
    // Added to stop retrying and infinite loop on error
    // TODO: Figure out if we should we do this
    transformationPoolCache[versionId].on("factoryCreateError", error => {
      // eslint-disable-next-line no-underscore-dangle
      transformationPoolCache[versionId]._waitingClientsQueue.dequeue().reject(error);
    });
    logger.debug("pool created");
  }
  return transformationPoolCache[versionId];
}

exports.getPool = getPool;
