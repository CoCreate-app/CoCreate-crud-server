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
}

module.exports = {
  replaceArray
};
