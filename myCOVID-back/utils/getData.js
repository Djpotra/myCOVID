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

module.exports = getData;