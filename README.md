# scrollwatch
A scroll watch JavaScript library.
I made this library as a light weight, high performance alternative to the existing scroll watchers.

Usage: 

  			scrollWatch.init([
  				{	
  					elements: $('.jQuery-selector'),
            // A predefined function name from: fullyVisible, touchTop, exitTop, whileOnScreen, 
            // OR a function returning the offset top of the element
  					onPosition: 'fullyVisible',
            // A class to toggle OR a function reciving the element
  					onElement: function(j, percentage) 
          }
        ]);
        
    
