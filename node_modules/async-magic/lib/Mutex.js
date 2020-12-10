
module.exports = class Mutex{

    constructor(){
        this.queue = [];
        this.isActive = false;
    }

    isLocked(){
        return this.isActive;
    }

    acquire(){
        return new Promise(function(resolve){

            // is lock free ?
            if (this.isActive === false){
                // immediately resolve promise
                this.isActive = true;
                return resolve();
            }

            // push resolve function into queue
            this.queue.push(resolve);
        }.bind(this))
    }

    release(){
        // other items within queue ?
        if (this.queue.length > 0){
            // extract first item and execute resolver after io schedule
            setImmediate(this.queue.shift());
        
        // no more items to process
        }else{
            this.isActive = false;
        }
    }

    // aliases
    lock(){
        return this.acquire();
    }
    unlock(){
        return this.release();
    }
}