import {projectMedia} from './projectMedia.js';

// Each visual belongs to this project's own official presentation. Keep exact
// feature associations: an image of a lobby must not imply a pictured pool.
const gallery=(project,suffix,title,description,features=[],kind='render')=>{
 const media=projectMedia[project].find(item=>item.file===`${project}-${suffix}.webp`);
 if(!media)throw new Error(`Missing lifestyle image: ${project}-${suffix}`);
 return {file:`gallery/${media.file}`,source:media.source,title,description,features,kind};
};
const detail=(project,suffix,source,title,description,features=[],kind='render')=>({file:`lifestyle/${project}-${suffix}.webp`,source,title,description,features,kind});

export const projectLifestyle={
 'tokyo-city':[
  gallery('tokyo-city','1-2','Garden entrance','A greener welcome home.',['Landscaped pedestrian courtyard']),
  gallery('tokyo-city','11-0','Play spaces','Room for little adventures.',['Play and sports areas']),
  gallery('tokyo-city','12-0','Sports spaces','Make movement part of your day.',['Play and sports areas']),
  gallery('tokyo-city','4-0','Step-free entrances','A thoughtful arrival, every day.',['Step-free entrances']),
  detail('tokyo-city','5-0','https://static.tildacdn.one/tild6139-3830-4535-b263-313533393938/photo.jpg','KONE elevators','Comfort between every floor.',['KONE elevators']),
  detail('tokyo-city','7-0','https://static.tildacdn.one/tild6636-3064-4866-b231-613732393738/X.jpg','Storage spaces','More space for the things you love.',['Storage spaces']),
  detail('tokyo-city','15-0','https://static.tildacdn.one/tild3461-3832-4765-b465-366232356439/22.jpg','Access control and security','A considered approach to everyday access.',['Access control and security'],'illustration'),
  detail('tokyo-city','10-0','https://static.tildacdn.one/tild3131-3630-4861-b230-303265386434/24.jpg','Garden seating','Find your quiet corner outdoors.',['Landscaped pedestrian courtyard']),
 ],
 'london-square':[
  gallery('london-square','1-0','English-inspired architecture','Character you can come home to.',['English-inspired architecture','Panoramic windows']),
  gallery('london-square','4-6','Landscaped private courtyard','A greener welcome home.',['Landscaped private courtyard']),
  gallery('london-square','4-8','Resident lounge','A place to pause and meet.'),
  gallery('london-square','4-3','Underground parking','Keep your car sheltered.',['Underground parking'],'illustration'),
  detail('london-square','4-4','https://static.tildacdn.one/tild3864-6266-4232-b162-336236376161/photo-1658758904121-.jpg','Individual gas heating','Comfort you can adjust at home.',['Individual gas heating'],'illustration'),
 ],
 'wilton-park':[
  gallery('wilton-park','6-4','Fitness room','Make movement part of your day.',['Fitness room']),
  gallery('wilton-park','6-1','Cinema room','Bring movie night closer to home.',['Library and cinema room']),
  gallery('wilton-park','6-2','Library','A quiet place for your next chapter.',['Library and cinema room']),
  gallery('wilton-park','6-3','Children’s room','Room for little adventures.',['Indoor children’s area']),
  detail('wilton-park','6-5','https://static.tildacdn.one/tild3938-3533-4831-b339-366339656638/_1.jpg','Stroller storage','More space for the things you love.',['Stroller storage']),
  gallery('wilton-park','5-0','Courtyard','Find your quiet corner outdoors.'),
 ],
 'seoul':[
  gallery('seoul','2-1','Business lobby','A considered welcome for your clients.',['Class A business centre']),
  gallery('seoul','2-0','Entrance','A thoughtful arrival, every day.'),
  gallery('seoul','3-0','Business architecture','Space for your next business chapter.',['12 commercial floors']),
 ],
 'urpaq-park':[
  gallery('urpaq-park','3-0','Courtyard','A greener welcome home.',['Landscaped pedestrian courtyard']),
  gallery('urpaq-park','6-1','Garden seating','Find your quiet corner outdoors.',['Landscaped pedestrian courtyard']),
  gallery('urpaq-park','6-0','Fountain','A refreshing centre to everyday life.'),
  detail('urpaq-park','4-16','https://static.tildacdn.one/tild3161-6234-4061-b462-636333343364/54.jpg','Play and sports areas','Make movement part of your day.',['Play and sports areas']),
  detail('urpaq-park','4-14','https://static.tildacdn.one/tild3038-3166-4665-a163-333133663132/cctv-security-techno.jpg','Access control and security','A considered approach to everyday access.',['Access control and security'],'illustration'),
 ],
 'hayat':[
  gallery('hayat','12-1','Neoclassical architecture with Eastern details','Character you can come home to.',['Neoclassical architecture with Eastern details']),
  detail('hayat','17-12','https://static.tildacdn.one/tild6565-3762-4133-b033-373233646337/22.jpg','Play spaces','Room for little adventures.'),
  gallery('hayat','19-0','Children’s centre','Spaces designed around family life.',['Indoor children’s area']),
  detail('hayat','19-1','https://static.tildacdn.one/tild3232-6637-4135-b637-663037323136/AI_Image_123.jpg','Indoor pool','A little more time for a swim.',['Fitness and pool facilities'],'illustration'),
  gallery('hayat','12-0','Step-free entrances','A thoughtful arrival, every day.',['Step-free entrances']),
 ],
 'esentai':[
  gallery('esentai','9-0','Landscaped pedestrian courtyard','Green spaces, play and time together.',['Landscaped pedestrian courtyard','Play and sports areas']),
  gallery('esentai','10-2','Underground parking','Keep your car sheltered.',['Underground parking']),
  gallery('esentai','11-0','Step-free entrances','A thoughtful arrival, every day.',['Step-free entrances']),
 ],
 'tokyo':[
  gallery('tokyo','4-2','Sakura alley and garden gazebos','Green spaces, play and time together.',['Sakura alley and garden gazebos','Landscaped pedestrian courtyard','Play and sports areas']),
  gallery('tokyo','10-0','Resident lounge','A place to pause and meet.'),
  detail('tokyo','12-0','https://static.tildacdn.one/tild6566-6164-4462-b966-633836373336/__________.jpg','KONE elevators','Comfort between every floor.',['KONE elevators']),
  gallery('tokyo','4-0','Japanese-inspired architecture','Character you can come home to.',['Japanese-inspired architecture']),
 ],
 'boston-tower':[
  gallery('boston-tower','1-0','Rooftop recreation terrace','Green spaces, play and time together.',['Rooftop recreation terrace','Play and sports areas','Landscaped outdoor spaces']),
  gallery('boston-tower','0-0','Shops and services within the building','Everyday essentials closer to home.',['Shops and services within the building']),
 ],
 'french-house':[
  gallery('french-house','1-0','A residential address in Osh','Character you can come home to.',['A residential address in Osh']),
 ],
};
