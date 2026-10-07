const margin = {top:40, right:30,bottom:50, left:70};
const width = 800;
const height = 400;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const barColor = "#606464";
const bodyBackgroundColor = "#fffaf0";

const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

const filters_screen = [
        {id:"all", label:"All", isActive:true},
        {id:"LED", label:"LED", isActive:false},
        {id:"LCD", label:"LCD", isActive:false},
        {id:"OLED", label:"OLED", isActive:false},
];

const filters_size = [
        {id:"all-sizes", label:"All Sizes", isActive:true},
        {id:"24", label:"24\"", min:23, max:24, isActive:false},
        {id:"32", label:"32\"", min:31, max:32, isActive:false},
        {id:"55", label:"55\"", min:54, max:55, isActive:false},
        {id:"65", label:"65\"", min:64, max:65, isActive:false},
        {id:"98", label:"98\"", min:98, max:98, isActive:false},
];

const binGenerator = d3.bin()
                .value(d => d.energyConsumption);