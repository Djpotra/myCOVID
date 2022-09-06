import axios from 'axios'

let geoRequests = axios.create({
    baseURL:'/api/geo',
    timeout:0,
}); 

let dataRequests = axios.create({
    baseURL:'/api/data',
    timeout:0,
});

let ncovRequests = axios.create({
    baseURL:'/api/ncov',
    timeout:0,
})

geoRequests.interceptors.response.use(res=>res.data);
ncovRequests.interceptors.response.use(res=>res.data);

export {
    geoRequests,
    dataRequests,
    ncovRequests
} 