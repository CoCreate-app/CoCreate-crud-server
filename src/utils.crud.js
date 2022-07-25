function replaceArray(data) {
  let keys = Object.keys(data);
  let objectData = {};

  keys.forEach((k) => {
    let nk = k
    if (/\[([0-9]*)\]/g.test(k)) {
      nk = nk.replace(/\[/g, '.');
      if (nk.endsWith(']'))
        nk = nk.slice(0, -1)
      nk = nk.replace(/\]./g, '.');
      nk = nk.replace(/\]/g, '.');
    }
    objectData[nk] = data[k];
  });
  
  return objectData;

  // let keys = Object.keys(data)

  // keys.forEach((k) => {
  //   let reg = /\[(\d+)\]/gm.exec(k)
  //   let newKey = null;
  //   if (reg && reg.length == 2) {
  //     newKey = k.replace(reg[0], "." + reg[1]);
  //     let newData = data[k];
  //     delete data[k];
  //     data[newKey] = newData
  //   }
  // })
  // return data;
}

module.exports = {
  replaceArray
};
