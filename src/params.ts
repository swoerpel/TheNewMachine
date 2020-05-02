
export var shape_properties = {
  colors: 4,
  rotations:[0,180],
  shape_sizes:[1,1],
  subshapes:[1,2], //1x1, 2x2, 3x3
  subshape_sizes:[1],
  color_alpha_values: [.25,.5,.75 ]
}


export var params = {
  canvas: {
    width: 3200,
    height: 3200 * 4
  },


  images: [
    {
      grid: {
        width: 16,
        height: 16 * 4,
      },
      mode: 0,
      kernel: 'B',
      shape: 'triangle',
      init_row: {
        mode: 1 , 
        group_size: 3 
      },
    },
    {
      grid: {
        width: 4,
        height: 4,
      },
      mode: 1,
      kernel: 'B',
      shape: 'circle',
      init_row: {
        mode:1, 
        group_size:3
      },
    } 
  ],

  // image_id(s) coorspond to 
  // indicies of array above
  composite: {
    mode: 'merge', 
    merge: {
      image_ids: [0,1]
    },
    mask:{
      image_ids:[0,1],
      mask_id: 2
    },
    single:{
      image_id: 0
    }
  },

  draw:{
    mode:'cycle', // cycle
  },

  color:{
    palette: 'Spectral'
  },

}



export var wolfram_kernels = {
  'A': [
      [1,1,1]
  ],

  'B':[
      [1,0,1],
      [0,1,0],
      [1,0,1]
  ],

  'C':[
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,1,1,1,1]
  ],
}

export var wolfram_modes = [
  'traditional',  //0
  'totalistic',   //1 
]

export var wolfram_init_row_modes = [
  'random',       //0
  'steps',        //1
  'alt_steps',    //2
  'left_group',   //3
  'center_group', //4
  'right_group',  //5
]




function load_wolfram_saved_seed(seed_id){
  let seeds = {
      '001':{
          value: '0112110332',
          //totalistic
          //base 4
          //kernel _
      },
      'elaborate':{
          value: '30704354884367603371136332181017622432501',
          //totalistic
          //base 9
          //kernel X
      },
      
      '000':{
          value: '201111210021012021010101222',
      },
      'large_triangles':{
          value: '00111100010000110011011001001111',
      },
      '110':{
          value: '00111110',
          // value: '01110110',
          base:2,
          kernel:3,
      },
      '30':{
          value: '01111000',
          base:2,
          kernel:3,
      },
      '66':{
          value: '01100110',
          base:2,
          kernel:3,
      },
      'chet_01':{
          value: '000211101020200222201221210',
          base:3,
          kernel:3,
      },
      'chet_02':{
          value: '2103121223300202012331132030023133032122202232301330110211231031',
          base:4,
          kernel:3,
      }
  }
  return seeds[seed_id]
}