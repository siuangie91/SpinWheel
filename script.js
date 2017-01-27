(function ($) {
    var s,
            Wheel = {
                settings: {
                    container: $('#wheel-container'),
                    circle: $('#wheel-container').children(),
                    originLocSpan: $('#location'),
                    originCoords: document.getElementById('origin').getBoundingClientRect(),
                    originCoordsX: document.getElementById('origin').getBoundingClientRect().left,
                    originCoordsY: document.getElementById('origin').getBoundingClientRect().top,
                    prevRotation: -90 //-90deg is the pre-existing rotation
                },

                init: function () {
                    s = this.settings;
                    this.circle();
                    this.onClick();
                    
                    this.settings.originLocSpan.html("("+this.settings.originCoordsX+","+this.settings.originCoordsY+")");
                    
                },

                circle: function () {
                    var count = 0;
                    function position(radius, wrapper) {
                        wrapper.children().each(function (index) {
                            var width = wrapper.width(), //width of wrapper (if = height, is diameter)
                                    height = wrapper.height(), //height of wrapper (if = width, is diameter)
                                    //step = the degree in radians of each sector
                                    step = (2 * Math.PI) / wrapper.children().length,
                                    //x = radius + (radius * cos(step) = x pos) - 50% of the item's width
                                    x = Math.round(width / 2 + radius * Math.cos(count) - $(this).width() / 2),
                                    y = Math.round(height / 2 + radius * Math.sin(count) - $(this).height() / 2);
                            $(this).css({
                                left: x + 'px',
                                top: y + 'px'
                            });

                            count += step; // increment by PI/6 to get to next one
                        });
                    }
                    
                    //position the circles the main wheel
                    position($('#wheel-container').width()/2, s.container);

                },

                onClick: function () {
                    function rotate(degrees) {
                        //rotate the wheel
                        console.log('spin');
                        
                        s.container.css({
                            'transform': 'rotate('+ degrees +'deg)'
                        });
                        
                        s.container.find('.spoke').css({
                            'transform': 'rotate('+ -degrees +'deg)'
                        });
                    }

                    var origin = -60; //each rotation is 60deg
                    s.circle.on('click', function () {
                        console.log('----------------------------------------------');
                        console.log(this.getBoundingClientRect());
                        var thisX = this.getBoundingClientRect().left - s.originCoordsX;
                        var thisY = this.getBoundingClientRect().top - s.originCoordsY;
                        console.log("(" + thisX + "," + thisY +")");
                        
                        var radius = Math.sqrt((thisX * thisX) + (thisY * thisY));
                        
                        var unitX = thisX / (radius);
                        var unitY = thisY / (radius);
                        
                        console.log(radius);
                        
                        console.log("unit coords: (" + unitX + "," + unitY + ")");
                        
                        var xTheta = Math.acos(unitX)*180/Math.PI;
                        var yTheta = Math.asin(unitY)*180/Math.PI;
                        
                        console.log("xTheta: " + xTheta);
                        console.log("yTheta: " + yTheta);
                        
                        console.log("prevRotation: " + s.prevRotation);
                        
                        var degrees;
                        
                        if(Math.round(xTheta) == 90 && Math.round(yTheta) == -90) {
                            degrees = s.prevRotation;
                        }
                        else {
                            if(Math.round(xTheta) == 30 && Math.round(yTheta) == 30) {
//                                degrees = -210;
                                degrees = s.prevRotation - 120;
                            }
                            if(Math.round(xTheta) == 30 && Math.round(yTheta) == -30) {
//                                degrees = -150;
                                degrees = s.prevRotation - 60;
                            }
                            if(Math.round(xTheta) == 150 && Math.round(yTheta) < 0) {
//                                degrees = -30;
                                degrees = s.prevRotation + 60;
                            }
                            if(Math.round(xTheta) == 150 && Math.round(yTheta) > 0) {
//                                degrees = 30;
                                degrees = s.prevRotation + 120;
                            }
                            if(Math.round(xTheta) == 90 && Math.round(yTheta) == 90) {
//                                degrees = 90;
                                degrees = s.prevRotation - 180;
                            }
                        }
                        
                        rotate(degrees);
                        
                        s.prevRotation = degrees;
                        
                    });

                }
            };

    Wheel.init();

})(jQuery);


