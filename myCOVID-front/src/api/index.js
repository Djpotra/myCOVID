import {geoRequests,dataRequests,ncovRequests} from './ajax'

export const getGeoJson = (adcode)=>geoRequests.get(`/${adcode}`);

export const getParentAdCode = (adcode)=>dataRequests.get(`/parent_adcode/${adcode}`);

export const getNcovJson = (adcode)=>ncovRequests.get(`/${adcode}`);
export const getChildNcovJson = (adcode)=>ncovRequests.get(`/child/${adcode}`);
export const getStatisticsDataJson = (adcode)=>ncovRequests.get(`/statisticsdata/${adcode}`);