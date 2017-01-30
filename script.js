(function ($) {
    var s,
            Wheel = {
                settings: {
                    container: $('#wheel-container'),
                    circle: $('#wheel-container').children('.spoke'),
                    spokeColor: $('.spoke-color'),
                    originLocSpan: $('#location'),
                    originCoords: document.getElementById('origin').getBoundingClientRect(),
                    originCoordsX: document.getElementById('origin').getBoundingClientRect().left,
                    originCoordsY: document.getElementById('origin').getBoundingClientRect().top,
                    prevRotation: -90, //-90deg is the pre-existing rotation
                    isSpinning: false
                },

                init: function () {
                    s = this.settings;
                    this.circle();
                    this.onClick();
                    
                    //display (x,y) of origin on screen, truncated to 2 decimal places
                    this.settings.originLocSpan.html("(" + s.originCoordsX.toString().substr(0,6) + "," + s.originCoordsY.toString().substr(0,6) + ")");
                    
                },

                circle: function () {
                    var count = 0;
                    function position(radius, wrapper) {
                        wrapper.children().each(function (index) {
                            var width = wrapper.width(), //width of wrapper (if = height, is diameter)
                                    height = wrapper.height(), //height of wrapper (if = width, is diameter)
                                    //step = the degree in radians of each sector
                                    step = (2 * Math.PI) / wrapper.children().length,
                                    //position spoke based on its index, its center point, and the radius of the wheel
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
//                        console.log('spin');
                        s.isSpinning = true;
                        
                        s.container.css({
                            'transform': 'rotate('+ degrees +'deg)'
                        });
                        
                        s.container.find('.spoke').css({
                            'transform': 'rotate('+ -degrees +'deg)'
                        });
                    }
                    
                    function resetDegrees() {
                        s.prevRotation = -90;
                    }
                    
//                    resetDegrees();

                    var origin = -60; //each rotation is 60deg
                    s.circle.on('click', function () {
                        
                        if(!s.isSpinning) {
                            s.isSpinning = true;
                            
                            s.container.removeClass('noTransition');
                        
                            console.log('----------------------------------------------');
                            // get (x,y) position of the clicked spoke
    //                        console.log(this.getBoundingClientRect());
                            var thisX = this.getBoundingClientRect().left - s.originCoordsX;
                            var thisY = this.getBoundingClientRect().top - s.originCoordsY;
    //                        console.log("(" + thisX + "," + thisY +")");

                            //find exact radius of circle using pythagorean theorem
                            //radius^2 = hypotenuse^2 = x^2 + y^2 
                            var radius = Math.sqrt((thisX * thisX) + (thisY * thisY));

                            //Math.<trig fcn> only take parameters that are btwn -1 and 1
                            //so divide the (x,y) positions by the radius to scale down to
                            //a unit circle (circle with radius = 1)
                            //and get the value of the scaled (x,y)
                            var unitX = thisX / (radius);
                            var unitY = thisY / (radius);

    //                        console.log(radius);

    //                        console.log("unit coords: (" + unitX + "," + unitY + ")");

                            //Get angle of the clicked spoke with respect to the origin
                            //by performing inverse cosine and inverse sine.
                            //Need to perform for both x and y
                            //since x will only tell you if it's in left or right or side
                            //and y will only tell you if it's in the top or bottom side.
                            //cosine corresponds to x pos, sine corresponds to y pos.
                            //acos() and asin() return values in radians,
                            //so convert to degrees by multipying by 180/PI
                            var xTheta = Math.acos(unitX)*180/Math.PI;
                            var yTheta = Math.asin(unitY)*180/Math.PI;

    //                        console.log("xTheta: " + xTheta);
    //                        console.log("yTheta: " + yTheta);

                            console.log("prevRotation: " + s.prevRotation);

                            var degrees;

                            //calculate rotation for when clicked spoke is on the axis of symmetry
                            if(Math.round(xTheta) == 90) {
                                //if clicked spoke is at the top (active spoke)
                                if(Math.round(yTheta) == -90) {
                                    degrees = s.prevRotation;
                                }
                                //if clicked spoke is at the bottom (base)
                                else { 
                                    degrees = s.prevRotation - 180;
                                }
                            }

                            //calculate rotation for when clicked spoke is on the right side (xTheta = 30)
                            if(Math.round(xTheta) - 90 < 0) {
                                //if clicked spoke is at the top right
                                if(Math.round(yTheta) < 0) { //yTheta = -30
                                    //rotate 60deg CCW
                                    degrees = s.prevRotation - 60;
                                }
                                //if clicked spoke is at the bottom right
                                else { //yTheta = 30
                                    //rotate 120deg CCW
                                    degrees = s.prevRotation - 120;
                                }
                            }
                            //calculate rotation for when clicked spoke is on the left side (xTheta = 150)
                            if(Math.round(xTheta) - 90 > 0) {
                                //if clicked spoke is at the top left
                                if(Math.round(yTheta) < 0) { //yTheta = -30
                                    //rotate 60deg CW
                                    degrees = s.prevRotation + 60;
                                }
                                //if clicked spoke is at the bottom left
                                else { //yTheta = 30
                                    //rotate 120deg CW
                                    degrees = s.prevRotation + 120;    
                                }
                            }

                            //remove all size settings
                            s.spokeColor.removeClass('large medium small');

                            //rotate wheel
                            rotate(degrees);
                            
                            //set s.prevRotation to current degrees
                            s.prevRotation = degrees;

                            console.log('new s.prevRotation: ' + s.prevRotation);

                            $(this).children('.spoke-color').addClass('large');
                            //make the ones adjacent to the active one size medium
                            $(this).prev('.spoke').children('.spoke-color').addClass('medium');
                            $(this).next('.spoke').children('.spoke-color').addClass('medium');

                            //makes the ones next to the adjacent ones size small
                            $(this).prev('.spoke').prev('.spoke').children('.spoke-color').addClass('small');
                            $(this).next('.spoke').next('.spoke').children('.spoke-color').addClass('small');

                            //if active spoke is the last one, make the first one (which is adjacent) size medium
                            if(s.circle.eq(5).children('.spoke-color').hasClass('large')) {
                                s.circle.eq(0).children('.spoke-color').addClass('medium');
                                //and make the 2nd one size small
                                s.circle.eq(1).children('.spoke-color').addClass('small');
                            }

                            //if active spoke is index 0, make the last one (which is adjacent) size medium
                            if(s.circle.eq(0).children('.spoke-color').hasClass('large')) {
                                s.container.trigger('reset');

                                s.circle.eq(5).children('.spoke-color').addClass('medium');
                                //and make the 4th one size small
                                s.circle.eq(4).children('.spoke-color').addClass('small');
                            }

                            // if active spoke is index 1
                            if(s.circle.eq(1).children('.spoke-color').hasClass('large')) {
                                // make the 5th one size small
                                s.circle.eq(5).children('.spoke-color').addClass('small');
                            }

                            // if active spoke is index 4
                            if(s.circle.eq(4).children('.spoke-color').hasClass('large')) {
                                // make index 0 size small
                                s.circle.eq(0).children('.spoke-color').addClass('small');
                            }
                            
                            setTimeout(function() {
                                s.isSpinning = false;
                            },800);
                            
                        }
                        
                    });

                    s.container.on('reset', function() {
                        
                        setTimeout(function() {
                            //add noTransition classs to container so that user does not see reset animation
                            s.container.addClass('noTransition');
                            //remove the style attribute altogether to clear degrees
                            s.container.removeAttr('style');
                            //reset s.prevRotation to -90;
                            resetDegrees();
                            console.log('reset');
                        }, 800);
                        
                    })
                }
            };

    Wheel.init();

})(jQuery);


