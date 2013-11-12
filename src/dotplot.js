function dotplot(element, config) {
    var self = this;
    this.element = element;
    this.scales = {
        horizontal: d3.scale.linear(),
        vertical: d3.scale.linear()
    };

    this.configure = function(configuration) {
        this.config = configuration || {};
        this.config.size = this.config.size || {
            width: 700,
            height: 700
        };
        this.config.padding = this.config.padding || {
            top : this.config.title ? 40 : 20,
            right : 40,
            bottom : this.config.xlabel ? 50 : 20,
            left : this.config.ylabel ? 50 : 20
        };

        this.config.extent = this.config.extent || {
            horizontal: [0, this.config.size.width],
            vertical: [0, this.config.size.height],
        };

        this.scales.horizontal
            .domain(this.config.extent.horizontal)
            .range([0, this.config.size.width]);

        this.scales.vertical
            .domain(this.config.extent.vertical)
            .range([this.config.size.height, 0]);
    };

    this.configure(config);
}
