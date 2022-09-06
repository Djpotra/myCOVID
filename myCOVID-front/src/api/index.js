import {geoRequests,dataRequests,ncovRequests} from './ajax'

export const getGeoJson = (adcode)=>geoRequests.get(`/${adcode}`);
export const getNcovJson = (adcode)=>ncovRequests.get(`/${adcode}`);