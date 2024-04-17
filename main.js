//Data utilities
//遇到空值就設定為undefined, 要不然就維持原本的字串
const parseNA = string => (string == ' -' ? undefined : string);

d3.csv('data/歷年國內主要觀光遊憩據點遊客人數月別統計.csv').then(
    res=>{
        console.log(res);
    }
)

function type(d){
    return{
        年別:+d.年別,
        類型:parseNA(d.類型),
        觀光遊憩區:parseNA(d.觀光遊憩區),
        細分:parseNA(d.細分),
        縣市別:parseNA(d.縣市別),
        一月:+d.一月,
        二月:+d.二月,
        三月:+d.三月,
        四月:+d.四月,
        五月:+d.五月,
        六月:+d.六月,
        七月:+d.七月,
        八月:+d.八月,
        九月:+d.九月,
        十月:+d.十月,
        十一月:+d.十一月,
        十二月:+d.十二月,
        合計:+d.合計,
    }
}

//Data selection
function filterData(data){
    return data.filter(
        d => {
            return(
                d.年別 > 2011 && d.年別 < 2022 &&
                d.類型 &&
                d.細分 &&
                d.縣市別 &&
                d.合計 > 0
            );
        }
    );
}

function prepareBarChartData(data){
    console.log(data);
    const dataMap = d3.rollup(
        data,
        v => d3.sum(v, leaf => leaf.合計),
        d => d.縣市別
    );
    const dataArray = Array.from(dataMap, d=>({合計:d[1], 縣市別:d[0]}));
    return dataArray;
}

function setupCanvas(barChartData){
    const svg_width = 400;
    const svg_height = 500;
    const chart_margin = {top:80, right:10, bottom:40, left:40};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);
    
    const this_svg = d3.select('.bar-chart-container').append('svg')
    .attr('width', svg_width).attr('height',svg_height)
    .append('g').attr('transform',`translate(${chart_margin.left}, ${chart_margin.top})`);

    //scale
    //V1.d3.extent find the max & min in revenue
    const xExtent = d3.extent(barChartData, d=>d.合計);
    // debugger;
    const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    //V2.0 ~ max
    const xMax = d3.max(barChartData, d=>d.合計);
    const xScale_v2 = d3.scaleLinear().domain([0, xMax]).range([0,chart_width]);
    //V3.Short writing for v2
    const xScale_v3 = d3.scaleLinear([0,xMax],[0, chart_width]);

    //垂直空間的分配-平均分布給各種類
    const yScale = d3.scaleBand().domain(barChartData.map(d=>d.縣市別))
                    .rangeRound([0, chart_height])
                    .paddingInner(0.25);


    //Draw bars
    const bars = this_svg.selectAll('.bar').data(barChartData).enter()
                    .append('rect').attr('class', 'bar')
                    .attr('x',0).attr('y', d=>yScale(d.縣市別))
                    .attr('width', d=>xScale_v3(d.合計))
                    .attr('height', yScale.bandwidth())
                    .style('fill', 'LightSkyBlue');

    //Draw header
    const header = this_svg.append('g').attr('class','bar-header')
                .attr('transform',`translate(0,${-chart_margin.top/2})`)
                .append('text');
    header.append('tspan').text('歷年國內主要觀光遊憩據點遊客人數月別統計');
    header.append('tspan').text('Years:2012-2021')
            .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');

    const xAxis = d3.axisTop(xScale_v3).tickFormat(formatTicks)
                    .tickSizeInner(-chart_height)
                    .tickSizeOuter(0);
    const yAxis=d3.axisLeft(yScale).tickSize(0);
    const xAxisDraw = this_svg.append('g').attr('class','x axis').call(xAxis);
    const yAxisDraw = this_svg.append('g').attr('class','y axis').call(yAxis);
    yAxisDraw.selectAll('text').attr('dx','-0.6em');
}

function formatTicks(d){
    return d3.format('~s')(d)
    .replace('M','mil')
    .replace('G','bil')
    .replace('T','tri')
}


//Main
function ready(data){
    const DataClean = filterData(data);
    const barChartData = prepareBarChartData(DataClean).sort(
        (a,b)=>{
            return d3.descending(a.合計, b.合計);
        }
    );
    console.log(barChartData);
    setupCanvas(barChartData);
}


// Load Data
d3.csv('data/歷年國內主要觀光遊憩據點遊客人數月別統計.csv', type).then(
    res=>{  
        console.log('CSV:',res[0]);
        ready(res);
        // debugger;
    }
);