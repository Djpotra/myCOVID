let axios = require('axios');

async function getData(url) {
    let data = await axios.request(url)
        .then(res => res.data.replaceAll('\n',''));
    let scripts = await data.match(/<body>.*<\/body>/)
    .reduce((cur,next)=>{
        return [...cur,...next.split(/<noscript.*>.*<\/noscript>/g)];
    },[])
    .reduce((cur,next)=>{
        return [...cur,...next.match(/<script.*>.*?<\/script>/)];
    },[])
    .reduce((cur,next)=>{
        return [...cur,...next.split(/<\/script>/g)];
    },[]);

    scripts = scripts.map(s=>s.replace(/<script.*>/g,'')).filter(s=>s.length>0);

    let window = {};
    scripts.forEach(s=>eval(s));
    
    return window;
}

// let fs = require('fs');
// const targetUrl = "https://ncov.dxy.cn/ncovh5/view/pneumonia";
// getData(targetUrl)
//   .then(res => {
//     console.log('data refreshed!');
//     for (let key in res) {
//       fs.writeFile(`../data/${key}.json`, JSON.stringify(res[key]), (err) => { if (err) console.log(err) });
//     }
//     fs.writeFile(`../data/data.json`, JSON.stringify(res), (err) => {});

//   });

module.exports = getData;