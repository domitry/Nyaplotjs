define([
    "underscore",
    "core",
    "utils/uuid"
], function(_, core, uuid){
    function Base(){
        this.plots=[];
        this.data_arr=[];
        
        _.extend(this, {
            div_id: "unknown",
            interactive: true,
            stage_uuid: uuid(),
            axis_uuid: uuid(),
            position_uuid: uuid(),
            label_uuid: uuid(),
            context_uuid: uuid(),
            background_uuid: uuid(),
            interactive_uuid: uuid(),
            plots_uuid: [],
            xscale_uuid: uuid(),
            yscale_uuid: uuid(),
            xscale_type: "linear",
            yscale_type: "linear",
            xdomain: [0,1],
            ydomain: [0,1],
            xrange: [10, 490],
            yrange: [490, 10],
            view_width: 500,
            view_height: 500,
            stage_width: 700,
            stage_height: 700,
            stage_margin: {x: 60, y: 10},
            label_margin: {bottom: 70, left: 60},
            xlabel: "X",
            ylabel: "Y"
        });

        _.each([
            "xlabel",
            "ylabel",
            "view_width",
            "view_height",
            "stage_width",
            "stage_height"
        ], _.bind(function(propname){
            this[propname+"_"] = _.bind(function(val){
                this[propname] = val;
                return this;
            }, this);
        }, this));
    }

    Base.prototype.show = function(div_id){
        this.div_id = div_id;
        var models = this.create_models();
        core.parse(models);
    };

    Base.prototype.create_axis = function(){
        this.axis = {
            type: "axis2d", uuid: this.axis_uuid, args: {
	            width: this.view_width,
	            height: this.view_height
            }, sync_args:{
                xscale: this.xscale_uuid,
                yscale: this.yscale_uuid
            }
        };
    };

    Base.prototype.create_position = function(){
        this.position = {
            type: "position2d", uuid: this.position_uuid, args: {},
            sync_args: {
                x: this.xscale_uuid,
                y: this.yscale_uuid
            }
        };
    };

    Base.prototype.create_sheets = function(){
        this.sheets = [
            this.background_uuid,
            this.axis_uuid,
            this.context_uuid,
            this.label_uuid
        ];
    };

    Base.prototype.create_interactive = function(){
        this.interactive_layer =  {
            type: "interactive_wheel", uuid: this.interactive_uuid, args: {
                size: [this.view_width, this.view_height],
                stage_uuid: this.stage_uuid
            }, sync_args: {
                xscale: this.xscale_uuid,
                yscale: this.yscale_uuid,
                updates: [this.axis_uuid].concat(this.plots_uuid)
            }
        };
    };

    Base.prototype.create_models = function(){
        this.plots_uuid = _.map(this.plots, function(p){return p.uuid;});
        this.create_axis();
        this.create_position();
        this.create_sheets();
        this.create_interactive();
        
        var prefix = [
            {
                type: "scale", uuid: this.xscale_uuid, args: {
	                type: this.xscale_type,
	                domain: this.xdomain,
	                range: this.xrange
                }
            },
            {
                type: "scale", uuid: this.yscale_uuid, args: {
	                type: this.yscale_type,
	                domain: this.ydomain,
	                range: this.yrange
                }
            },
            this.position
        ];

        var sheets = [
            this.axis,
            {
                type: "label", uuid: this.label_uuid, args: {
	                x: this.xlabel,
	                y: this.ylabel,
	                width: this.view_width,
	                height: this.view_height,
	                margin: this.label_margin
                }
            },
            {
                type: "background2d", uuid: this.background_uuid, args: {
	                width: this.view_width,
	                height: this.view_height
                }
            },
            {
                type: "context2d", uuid: this.context_uuid, args: {
                    width: this.view_width,
                    height: this.view_height
                },
                sync_args: {
                    glyphs: this.plots_uuid
                }
            }
        ];

        if(this.interactive){
            sheets.push(this.interactive_layer);
        }

        var sufix = [
            {
                type: "stage2d", uuid: this.stage_uuid, args: {
	                width: this.stage_width,
	                height: this.stage_height,
	                margin: this.stage_margin
                },sync_args: {
                    sheets: this.sheets
                }
            }];

        if(this.interactive)
            sufix[0].sync_args.sheets.push(this.interactive_uuid);

        return Array.prototype.concat(this.data_arr, prefix, this.plots, sheets, sufix);
    };

    return Base;
});
