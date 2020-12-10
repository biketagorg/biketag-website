// resolves multiple promises in parallel
async function parallel(resolvers, limit=false){

    // buffer
    const results = [];

    // calculate chunk size
    // limit step size to input array size
    const chunkSize = Math.min(limit || 1000, resolvers.length);

    // process resolvers in chunks
    for (let i=0;i<resolvers.length;i=i+chunkSize){

        // extract current chunk
        const chunk = resolvers.slice(i, Math.min(i+chunkSize, resolvers.length));

        // resolve current chunk
        // eslint-disable-next-line no-await-in-loop
        const intermediateResults = await Promise.all(chunk.map((r) => r.resolve()));

        // push results into buffer
        results.push(...intermediateResults);
    }

    // return results
    return results;
}

module.exports = parallel;