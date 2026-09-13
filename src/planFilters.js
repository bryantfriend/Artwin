export function filterPlans(plans,{bedrooms='All',area='all',savedOnly=false,saved=[],sort='ascending'}={}){
  return plans.filter(p=>(bedrooms==='All'||p.bedrooms===bedrooms)&&(area==='all'||area==='small'&&p.area<80||area==='medium'&&p.area>=80&&p.area<=110||area==='large'&&p.area>110)&&(!savedOnly||saved.includes(p.id))).sort((a,b)=>sort==='descending'?b.area-a.area:a.area-b.area);
}
