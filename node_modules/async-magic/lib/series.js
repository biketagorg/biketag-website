// resolves multiple promises in series
async function series(resolvers, failOnError=true){
    // buffer
    const results = [];

    // run resolvers in series
    for (const r of resolvers){
        try{
            // eslint-disable-next-line no-await-in-loop
            results.push(await r.resolve());
        }catch(e){
            if (failOnError){
                throw e;
            }else{
                results.push(e);
            }
        }
    }

    // return results
    return results;
}

module.exports = series;