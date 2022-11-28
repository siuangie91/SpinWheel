var Wheel = (function () {
  var s = {
    //            blocker: $('#blocker'),
    container: $('#pp-wheel-container'),
    circle: $('#pp-wheel-container').children('.pp-spoke'),
    spokeColor: $('.pp-spoke-color'),
    originLocSpan: $('#pp-location'),
    originCoords: $('#pp-origin').offset(),
    originCoordsX: $('#pp-origin').offset().left,
    originCoordsY: $('#pp-origin').offset().top,
    prevRotation: -90, //-90deg is the pre-existing rotation
    isSpinning: false,
    varyRotationSpeed: false,
    rotationSpeed: 800, //default rotation speed for when varyRotationSpeed = false
  };

  var circle = function () {
    var count = 0;
    function position(radius, wrapper) {
      wrapper.children().each(function (index) {
        var width = wrapper.width(), //width of wrapper (if = height, is diameter)
          height = wrapper.height(), //height of wrapper (if = width, is diameter)
          //step = the degree in radians of each sector
          step = (2 * Math.PI) / wrapper.children().length,
          //position spoke based on its index, its center point, and the radius of the wheel
          x = Math.round(
            width / 2 + radius * Math.cos(count) - $(this).width() / 2
          ),
          y = Math.round(
            height / 2 + radius * Math.sin(count) - $(this).height() / 2
          );

        $(this).css({
          left: x + 'px',
          top: y + 'px',
        });

        count += step; // increment by PI/6 to get to next one
      });
    }

    //position the circles the main wheel
    position($('#pp-wheel-container').width() / 2, s.container);
  };

  var origRotation = -60;

  var rotate = function (degrees) {
    //rotate the wheel
    s.isSpinning = true;
    //            s.blocker.addClass('open');
    s.container.css({
      transform: 'rotate(' + degrees + 'deg)',
    });

    s.container.find('.pp-spoke').css({
      transform: 'rotate(' + -degrees + 'deg)',
    });
  };

  var resetDegrees = function (deg) {
    s.prevRotation = deg;
  };

  var setRotationSpeed = function (speedInMs) {
    if (s.varyRotationSpeed) {
      s.container.css('transition-duration', speedInMs + 'ms');
      s.circle.css('transition-duration', speedInMs + 'ms');
      s.spokeColor.css('transition-duration', speedInMs + 'ms');

      s.rotationSpeed = speedInMs;
    }
  };

  var spinWheel = function (which) {
    console.log('which: ' + which);
    //only spin if not already spinning
    if (!s.isSpinning) {
      //is now spinning
      s.isSpinning = true;

      s.container.removeClass('noTransition');

      console.log('----------------------------------------------');
      // get (x,y) position of the clicked spoke
      var thisX = which.offset().left - s.originCoordsX;
      var thisY = which.offset().top - s.originCoordsY;

      console.log('thisX: ' + thisX);
      console.log('thisY: ' + thisY);

      //find exact radius of circle using pythagorean theorem
      //radius^2 = hypotenuse^2 = x^2 + y^2
      var radius = Math.sqrt(thisX * thisX + thisY * thisY);

      //Math.<trig fcn> only take parameters that are btwn -1 and 1
      //so divide the (x,y) positions by the radius to scale down to
      //a unit circle (circle with radius = 1)
      //and get the value of the scaled (x,y)
      var unitX = thisX / radius;
      var unitY = thisY / radius;

      //Get angle of the clicked spoke with respect to the origin
      //by performing inverse cosine and inverse sine.
      //Need to perform for both x and y
      //since x will only tell you if it's in left or right or side
      //and y will only tell you if it's in the top or bottom side.
      //cosine corresponds to x pos, sine corresponds to y pos.
      //acos() and asin() return values in radians,
      //so convert to degrees by multipying by 180/PI
      var xTheta = (Math.acos(unitX) * 180) / Math.PI;
      var yTheta = (Math.asin(unitY) * 180) / Math.PI;

      console.log('xTheta: ' + xTheta);
      console.log('yTheta: ' + yTheta);

      var degrees;

      //calculate rotation for when clicked spoke is on the axis of symmetry
      if (Math.round(xTheta) == 90) {
        //if clicked spoke is at the top (active spoke)
        if (Math.round(yTheta) == -90) {
          degrees = s.prevRotation;
        }
        //if clicked spoke is at the bottom (base)
        else {
          degrees = s.prevRotation - 180;
          setRotationSpeed(1400);
        }
      }

      //calculate rotation for when clicked spoke is on the right side (xTheta = 30)
      if (Math.round(xTheta) - 90 < 0) {
        //if clicked spoke is at the top right
        if (Math.round(yTheta) < 0) {
          //yTheta = -30
          //rotate 60deg CCW
          degrees = s.prevRotation - 60;
          setRotationSpeed(600);
        }
        //if clicked spoke is at the bottom right
        else {
          //yTheta = 30
          //rotate 120deg CCW
          degrees = s.prevRotation - 120;
          setRotationSpeed(1000);
        }
      }
      //calculate rotation for when clicked spoke is on the left side (xTheta = 150)
      if (Math.round(xTheta) - 90 > 0) {
        //if clicked spoke is at the top left
        if (Math.round(yTheta) < 0) {
          //yTheta = -30
          //rotate 60deg CW
          degrees = s.prevRotation + 60;
          setRotationSpeed(600);
        }
        //if clicked spoke is at the bottom left
        else {
          //yTheta = 30
          //rotate 120deg CW
          degrees = s.prevRotation + 120;
          setRotationSpeed(1000);
        }
      }

      //remove all size settings
      s.spokeColor.removeClass('large medium small');

      //rotate wheel
      rotate(degrees);

      //set s.prevRotation to current degrees
      s.prevRotation = degrees;

      console.log('new s.prevRotation: ' + s.prevRotation);

      which.children('.pp-spoke-color').addClass('large');
      //make the ones adjacent to the active one size medium
      which.prev('.pp-spoke').children('.pp-spoke-color').addClass('medium');
      which.next('.pp-spoke').children('.pp-spoke-color').addClass('medium');

      //makes the ones next to the adjacent ones size small
      which
        .prev('.pp-spoke')
        .prev('.pp-spoke')
        .children('.pp-spoke-color')
        .addClass('small');
      which
        .next('.pp-spoke')
        .next('.pp-spoke')
        .children('.pp-spoke-color')
        .addClass('small');

      //implement size changes
      if (s.circle.eq(0).children('.pp-spoke-color').hasClass('large')) {
        //trigger rotation reset so that degrees doesn't become too large or too negative
        s.container.trigger('reset', [-90]);

        //if active spoke is index 0, make the last one (which is adjacent) size medium
        s.circle.eq(5).children('.pp-spoke-color').addClass('medium');
        //and make the 4th one size small
        s.circle.eq(4).children('.pp-spoke-color').addClass('small');
      }

      // if active spoke is index 1
      if (s.circle.eq(1).children('.pp-spoke-color').hasClass('large')) {
        s.container.trigger('reset', [-150]);

        // make the 5th one size small
        s.circle.eq(5).children('.pp-spoke-color').addClass('small');
      }

      if (s.circle.eq(2).children('.pp-spoke-color').hasClass('large')) {
        s.container.trigger('reset', [-210]);
      }

      if (s.circle.eq(3).children('.pp-spoke-color').hasClass('large')) {
        s.container.trigger('reset', [-270]);
      }

      // if active spoke is index 4
      if (s.circle.eq(4).children('.pp-spoke-color').hasClass('large')) {
        s.container.trigger('reset', [30]);

        // make index 0 size small
        s.circle.eq(0).children('.pp-spoke-color').addClass('small');
      }

      if (s.circle.eq(5).children('.pp-spoke-color').hasClass('large')) {
        s.container.trigger('reset', [-30]);

        //if active spoke is the last one, make the first one (which is adjacent) size medium
        s.circle.eq(0).children('.pp-spoke-color').addClass('medium');
        //and make the 2nd one size small
        s.circle.eq(1).children('.pp-spoke-color').addClass('small');
      }

      //wait until anim is finished before allowing click again
      setTimeout(function () {
        s.isSpinning = false;
        //                    s.blocker.removeClass('open');
      }, s.rotationSpeed);
    }
  };

  var onClick = function () {
    s.circle.on('click', function () {
      spinWheel($(this));
    });

    s.container.on('reset', function (evt, deg) {
      setTimeout(function () {
        //add noTransition classs to container so that user does not see reset animation
        s.container.addClass('noTransition');
        //remove the style attribute altogether to clear degrees
        s.container.removeAttr('style');
        //reset rotation on spoke and spoke content as well without calling
        //rotate() function b/c no need to check if s.isSpinning = true
        s.container.css({
          transform: 'rotate(' + deg + 'deg)',
        });

        s.container.find('.pp-spoke').css({
          transform: 'rotate(' + -deg + 'deg)',
        });
        resetDegrees(deg);
      }, s.rotationSpeed);
    });
  };

  var displayOriginCoords = function () {
    //display (x,y) of origin on screen, truncated to 2 decimal places
    s.originLocSpan.html(
      '(' +
        s.originCoordsX.toString().substr(0, 6) +
        ',' +
        s.originCoordsY.toString().substr(0, 6) +
        ')'
    );
  };

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // The origin "binds" ALL the trig together!!! Need to "re-obtain" it every time the window is resized.
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  var obtainOrigin = function () {
    $(window).resize(function () {
      s.originCoords = $('#pp-origin').offset();
      s.originCoordsX = $('#pp-origin').offset().left;
      s.originCoordsY = $('#pp-origin').offset().top;

      displayOriginCoords();
    });
  };

  var bindUIResetOnResize = function () {
    $(window).on('resize', function () {
      // Trigger click on 1st wheel spoke
      if (!$('[data-name="content1"]').hasClass('active')) {
        $('.pp-spoke[data-content="content1"]').trigger('click');
      }
    });
  };

  return {
    init: function () {
      circle();
      onClick();
      displayOriginCoords();
      obtainOrigin();
      bindUIResetOnResize();
    },
    circle: s.circle,
    rotationSpeed: s.rotationSpeed,
  };
})();

var ContentSwitch = (function () {
  /*** Event polyfills for IE ***/
  var eventConstructor = function (name) {
    if (
      !!navigator.userAgent.match(/Trident/g) ||
      !!navigator.userAgent.match(/MSIE/g)
    ) {
      var theEvent = document.createEvent('Event');
      theEvent.initEvent(name, true, true);
      return theEvent;
    } else {
      return new Event(name);
    }
  };

  var finishedSwitchingEvent = eventConstructor('finishedSwitching');

  var spokes = {
    s1: $('[data-content="content1"]'),
    s2: $('[data-content="content2"]'),
    s3: $('[data-content="content3"]'),
    s4: $('[data-content="content4"]'),
    s5: $('[data-content="content5"]'),
    s6: $('[data-content="content6"]'),
  };

  var tabs = {
    t1: $('[data-name="content1"]'),
    t2: $('[data-name="content2"]'),
    t3: $('[data-name="content3"]'),
    t4: $('[data-name="content4"]'),
    t5: $('[data-name="content5"]'),
    t6: $('[data-name="content6"]'),
  };

  var bindClick = function () {
    $.each(spokes, function () {
      $(this).click(function () {
        //                    console.log('active spoke: ' + $('.accord.active').data('name'));
        var thisDataContent = $(this).data('content');
        console.log('thisDataContent: ' + thisDataContent);

        // no animation for currently active spoke
        $('.pp-accord.active').removeClass('active');
        $('.pp-accord[data-name="' + $(this).data('content') + '"]').addClass(
          'active'
        );
        document.dispatchEvent(finishedSwitchingEvent, false);
      });
    });
  };

  var bindSwitchingEvent = function () {
    $(document).on('finishedSwitching', function () {
      var currentTab = $('.pp-accord.active').data('name');
      console.log('currentTab: ' + currentTab);

      $('.pp-accord').removeClass('right left upper lower bottom');
      $('.pp-accord').addClass('hide');

      switch (currentTab) {
        case 'content1':
          tabs.t2.addClass('right upper');
          tabs.t3.addClass('right lower');
          tabs.t4.addClass('bottom');
          tabs.t5.addClass('left lower');
          tabs.t6.addClass('left upper');
          break;

        case 'content2':
          tabs.t1.addClass('left upper');
          tabs.t3.addClass('right upper');
          tabs.t4.addClass('right lower');
          tabs.t5.addClass('bottom');
          tabs.t6.addClass('left lower');
          break;

        case 'content3':
          tabs.t1.addClass('left lower');
          tabs.t2.addClass('left upper');
          tabs.t4.addClass('right upper');
          tabs.t5.addClass('right lower');
          tabs.t6.addClass('bottom');
          break;

        case 'content4':
          tabs.t1.addClass('bottom');
          tabs.t2.addClass('left lower');
          tabs.t3.addClass('left upper');
          tabs.t5.addClass('right upper');
          tabs.t6.addClass('right lower');
          break;

        case 'content5':
          tabs.t1.addClass('right lower');
          tabs.t2.addClass('bottom');
          tabs.t3.addClass('left lower');
          tabs.t4.addClass('left upper');
          tabs.t6.addClass('right upper');
          break;

        case 'content6':
          tabs.t1.addClass('right upper');
          tabs.t2.addClass('right lower');
          tabs.t3.addClass('bottom');
          tabs.t4.addClass('left lower');
          tabs.t5.addClass('left upper');
          break;
      }

      setTimeout(function () {
        $('.pp-accord').removeClass('hide');
      }, Wheel.rotationSpeed / 4);
    });
  };

  return {
    init: function () {
      bindClick();
      bindSwitchingEvent();
    },
  };
})();

var Accordion = (function () {
  var tab = $('.pp-accord .pp-header');

  var bindClick = function () {
    tab.click(function () {
      tab.each(function () {
        $(this).parent('.pp-accord').removeClass('active');
      });
      $(this).parent('.pp-accord').addClass('active');

      // Trigger click on corresponding wheel spoke
      var contentNum = $(this).parent('.pp-accord').data('name');
      console.log(contentNum);
      $('.pp-spoke[data-content="' + contentNum + '"]').trigger('click');
    });
  };

  return {
    init: function () {
      bindClick();
    },
  };
})();

$(document).ready(function () {
  Wheel.init();
  Accordion.init();
  ContentSwitch.init();
});
