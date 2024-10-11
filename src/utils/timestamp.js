function toTimeStamp(str){
    const date = new Date(str);
    return Math.floor(date.getTime()/ 1000);
}


module.exports = {toTimeStamp};