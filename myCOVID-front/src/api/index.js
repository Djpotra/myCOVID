import {geoRequests,dataRequests} from './ajax'

export const getGeoJson = (adcode)=>geoRequests.get(`/${adcode}`);