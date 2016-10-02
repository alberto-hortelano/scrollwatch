
var scrollWatch = {
  windowScrollTop: 0,
  windowHeight: 0,
  targets: [],
  settings: {
    resizeDelay: 250,
    scrollDelay: 20
  },
  positionFunctions: { 
    // They return the window.offsetTop at wich the element must be shown
    // this is scrollWatch.targets[i]
    fullyVisible: function(j) {
      return Math.floor(this.elements.eq(j).offset().top + this.elements.eq(j).height() - scrollWatch.windowHeight)
    },
    touchTop: function(j) {
      return Math.floor(this.elements.eq(j).offset().top)
    },
    exitTop: function(j) {
      return Math.floor(this.elements.eq(j).offset().top + this.elements.eq(j).height())
    },
    whileOnScreen: function(j) {
      return [Math.floor(this.elements.eq(j).offset().top - scrollWatch.windowHeight), Math.floor(this.elements.eq(j).offset().top + this.elements.eq(j).height())]
    }
  },
  sortTargets: function(toSort) {
    for (var i = 0; i < toSort.length; i++) {
      toSort[i] = [toSort[i], i]
    }
    toSort.sort(function(left, right) {
      return left[0] > right[0] ? 1:-1
    })
    var sortIndices = []
    for (var j = 0; j < toSort.length; j++) {
      sortIndices.push(toSort[j][1])
      toSort[j] = toSort[j][0]
    }
    return sortIndices
  },
  scrollingOnce: function(i,j) {
    if (scrollWatch.targets[i].offsets[j] <= scrollWatch.windowScrollTop) {
      scrollWatch.targets[i].onElement(scrollWatch.targets[i].newIndices[j])
    }
  },
  scrollingForever: function(i,j) {
    var offset = scrollWatch.targets[i].offsets[j]
    var newIndex = scrollWatch.targets[i].newIndices[j]
    if (Array.isArray(offset) && offset[0] <= scrollWatch.windowScrollTop && offset[1] >= scrollWatch.windowScrollTop) {
      var percentage = Math.round(100*(scrollWatch.windowScrollTop - offset[0])/(offset[1] - offset[0]))
      scrollWatch.targets[i].onElement(newIndex, percentage)
    }else if (offset >= 0 && offset <= scrollWatch.windowScrollTop) {
      scrollWatch.targets[i].onElement(newIndex, false)
      scrollWatch.targets[i].offsets[j] = -scrollWatch.targets[i].offsets[j]
    } else if (offset < 0 && -offset > scrollWatch.windowScrollTop) {
      scrollWatch.targets[i].onElement(newIndex, true)
      scrollWatch.targets[i].offsets[j] = -offset
    }
  },
  scrollTimer: false,
  scrollCounter: 0,
  debounce: function() {
    if (scrollWatch.scrollCounter%Math.ceil(scrollWatch.settings.scrollDelay/10) != 0) {
      clearTimeout(scrollWatch.scrollTimer)
    }
    scrollWatch.scrollTimer = setTimeout(function() {
      scrollWatch.onScroll()
    },scrollWatch.settings.scrollDelay)
    scrollWatch.scrollCounter++
  },
  onScroll: function() {
    var newScrollTop = Math.floor($(window).scrollTop())
    var scrollingDown = true
    if(scrollWatch.windowScrollTop > newScrollTop) scrollingDown = false
    scrollWatch.windowScrollTop = newScrollTop

    // For every target
    for (var i = 0; i < scrollWatch.targets.length; i++) {
      if (scrollingDown) {
        var init = 0
        var compare = scrollWatch.targets[i].offsets.length
        var modifier = +1
      }else{
        var init = scrollWatch.targets[i].offsets.length - 1
        var compare = 0
        var modifier = -1
      }

      if (scrollWatch.targets[i].onlyOnce) {
        // For every element in target
        if (scrollingDown) {
          for (var j = 0; j < scrollWatch.targets[i].offsets.length; j++) {
            scrollWatch.scrollingOnce(i,j)
          }
        }else{
          for (var j = scrollWatch.targets[i].offsets.length - 1; j >= 0; j--) {
            scrollWatch.scrollingOnce(i,j)
          }
        }
      }else{
        // For every element in target
        if (scrollingDown) {
          for (var j = 0; j < scrollWatch.targets[i].offsets.length; j++) {
            scrollWatch.scrollingForever(i,j)
          }
        }else{
          for (var j = scrollWatch.targets[i].offsets.length - 1; j >= 0; j--) {
            scrollWatch.scrollingForever(i,j)
          }
        }
      }
    }
  },
  resizeTimer: false,
  onResize: function() {
    clearTimeout(scrollWatch.resizeTimer)
    scrollWatch.resizeTimer = setTimeout(function() {

      scrollWatch.windowHeight = $(window).height()

      // For every target
      for (var i = 0; i < scrollWatch.targets.length; i++) {
        // Empty offsets array
        scrollWatch.targets[i].offsets = []
        // For every element in target
        for (var j = 0; j < scrollWatch.targets[i].elements.length; j++) {
          // Fill target's event-rising window's scrollTop values: target.offsets
          var onPosition = scrollWatch.targets[i].onPosition(j)
          if (onPosition < 0) {
            onPosition = 0
          }
          scrollWatch.targets[i].offsets.push(onPosition)
        }
        // Sort arrays
        scrollWatch.targets[i].newIndices = scrollWatch.sortTargets(scrollWatch.targets[i].offsets)
      }
      scrollWatch.onScroll()
    },scrollWatch.settings.resizeDelay)
  },
  newTarget: function(options) {
    var newTarget = {
      elements: false,
      offsets: [],
      onPosition: 'fullyVisible',
      onElement: 'sw-visible',
      onlyOnce: false
    }
    for (option in options) {
      newTarget[option] = options[option]
    }
    if (typeof newTarget.onPosition === "string") {
      newTarget.onPosition = scrollWatch.positionFunctions[newTarget.onPosition]
    }
    if (typeof newTarget.onElement === "string") {
      var className = newTarget.onElement
      newTarget.onElement = function(j, exitScreen) {
        if (exitScreen) {
          this.elements.eq(j).removeClass(className)
        }else{
          this.elements.eq(j).addClass(className)
        }
      }
    }
    scrollWatch.targets.push(newTarget)
  },
  init: function(targets, settings) {
    var onScroll = scrollWatch.onScroll
    if(typeof settings != 'undefined'){
      if(typeof settings.resizeDelay != 'undefined'){
        scrollWatch.settings.resizeDelay = settings.resizeDelay
      }
      if(typeof settings.scrollDelay != 'undefined'){
        scrollWatch.settings.scrollDelay = settings.scrollDelay
        onScroll = scrollWatch.debounce
      }
    }
    if(!Array.isArray(targets)){ // Only one target as object
      scrollWatch.newTarget(targets)
    }else{ // Multiple targets in array
      for (var i = 0; i < targets.length; i++) {
        scrollWatch.newTarget(targets[i])
      }
    }
    scrollWatch.onResize()
    $(window).on('scroll', onScroll);
    $(window).on('resize', scrollWatch.onResize);
  }
}