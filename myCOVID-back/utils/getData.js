let axios = require('axios');

async function getData(url) {
    let data = await axios.request(url)
        .then(res => res.data.replaceAll('\n',''));
    let scripts = data.match(/<body>(.*)<\/body>/)[1]
    .replace(/<noscript>(.*?)<\/noscript>/g,'')
    .match(/<script.*?>.+?<\/script>/g)
    .reduce((cur,next)=>{
        return [...cur,next.replace(/<script.*?>/g,'').replace(/<\/script>/g,'')];
    },[])
    
    let window = {};
    scripts.forEach(s=>eval(s));
    // console.log(scripts);
    
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