var Choropleth = require('@src/traces/choropleth');

var Plotly = require('@lib');
var Plots = require('@src/plots/plots');
var Lib = require('@src/lib');

var d3 = require('d3');
var createGraphDiv = require('../assets/create_graph_div');
var destroyGraphDiv = require('../assets/destroy_graph_div');
var mouseEvent = require('../assets/mouse_event');

var customAssertions = require('../assets/custom_assertions');
var assertHoverLabelStyle = customAssertions.assertHoverLabelStyle;
var assertHoverLabelContent = customAssertions.assertHoverLabelContent;

describe('Test choropleth', function() {
    'use strict';

    describe('supplyDefaults', function() {
        var traceIn,
            traceOut;

        var defaultColor = '#444',
            layout = {
                font: Plots.layoutAttributes.font
            };

        beforeEach(function() {
            traceOut = {};
        });

        it('should slice z if it is longer than locations', function() {
            traceIn = {
                locations: ['CAN', 'USA'],
                z: [1, 2, 3]
            };

            Choropleth.supplyDefaults(traceIn, traceOut, defaultColor, layout);
            expect(traceOut.z).toEqual([1, 2]);
        });

        it('should make trace invisible if locations is not defined', function() {
            traceIn = {
                z: [1, 2, 3]
            };

            Choropleth.supplyDefaults(traceIn, traceOut, defaultColor, layout);
            expect(traceOut.visible).toBe(false);
        });

        it('should make trace invisible if z is not an array', function() {
            traceIn = {
                z: 'no gonna work'
            };

            Choropleth.supplyDefaults(traceIn, traceOut, defaultColor, layout);
            expect(traceOut.visible).toBe(false);
        });
    });
});

describe('Test choropleth hover:', function() {
    var gd;

    afterEach(destroyGraphDiv);

    function run(pos, fig, content, style) {
        gd = createGraphDiv();

        style = style || {
            bgcolor: 'rgb(68, 68, 68)',
            bordercolor: 'rgb(255, 255, 255)',
            fontColor: 'rgb(255, 255, 255)',
            fontSize: 13,
            fontFamily: 'Arial'
        };

        return Plotly.plot(gd, fig).then(function() {
            mouseEvent('mousemove', pos[0], pos[1]);
            assertHoverLabelContent([content, null]);
            assertHoverLabelStyle(d3.select('g.hovertext'), style);
        });
    }

    it('should generate hover label info (base)', function(done) {
        var fig = Lib.extendDeep({}, require('@mocks/geo_first.json'));

        run(
            [400, 160],
            fig,
            [['RUS', '10', ''], 'trace 1']
        )
        .then(done);
    });

    it('should generate hover label info (\'text\' array case)', function(done) {
        var fig = Lib.extendDeep({}, require('@mocks/geo_first.json'));
        fig.data[1].text = ['tExT', 'TeXt', '-text-'];
        fig.data[1].hoverinfo = 'text';

        run(
            [400, 160],
            fig,
            ['-text-', null]
        )
        .then(done);
    });

    it('should generate hover label with custom styling', function(done) {
        var fig = Lib.extendDeep({}, require('@mocks/geo_first.json'));
        fig.data[1].hoverlabel = {
            bgcolor: 'red',
            bordercolor: ['blue', 'black', 'green'],
            font: {family: 'Roboto'}
        };

        run(
            [400, 160],
            fig,
            [['RUS', '10', ''], 'trace 1'],
            {
                bgcolor: 'rgb(255, 0, 0)',
                bordercolor: 'rgb(0, 128, 0)',
                fontColor: 'rgb(0, 128, 0)',
                fontSize: 13,
                fontFamily: 'Roboto'
            }
        )
        .then(done);
    });
});
