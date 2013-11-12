function dotplot(element, config) {
    var self = this;
    this.element = element;

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
    };
    this.configure(config);
}
