/**
 * @file: photobox.js
 *
 * Author: Mikita Stankiewicz
 * URL: http://designed.bymikita.com/photobox/
 * Version: 0.1
 */

;( function( $, window, document, undefined ) {
	/**
	 * Constructor
	 */
	var Photobox = function( items, options ) {
		this.$items = $( items );
		this.options = options; // not used so far
	};
	
	/**
	 * Photobox prototype
	 */
	Photobox.prototype = {
		/**
		 * Some vars
		 */
		cache: [],
		items: [],
		current: 0,
		is_gallery: true,
		defaults: {},
		options: {},
		config: {},
		
		/**
		 * Init
		 */
		init: function() {
			// config
			this.config = $.extend( {}, this.defaults, this.options );
			
			var PB = this;
			
			this.$items.each( function( n ) {
				PB.items.push( $( this ).attr( 'href' ) );
				
				$( this ).click( function( e ) {
					e.preventDefault();
					
					PB.open( n );
				} );
			} );
		},
		
		/**
		 * Load image
		 */
		load: function( n ) {
			this.title( n );
			
			// already loaded
			if( '' != $( '#photobox .photobox-placeholder' ).eq( n ).html() )
				return;
			
			var src = this.$items.eq( n ).attr( 'href' );
			
			function i() {
				$( '#photobox .photobox-placeholder' ).eq( n ).html( $( '<img />' ).attr( 'src', src ) );
				
				setTimeout( function() {
					c();
				}, 1 );
				
				$( window ).resize( function() {
					c();
				} );
			}
			
			function c() {
				var placeholder = $( '#photobox .photobox-placeholder' ).eq( n );
				var image = placeholder.find( 'img' );
				
				image.css( {
					'left': placeholder.width() / 2 - image.width() / 2,
					'top': placeholder.height() / 2 - image.height() / 2
				} );
			}
			
			// check if it already preloaded
			if( -1 !== $.inArray( src, this.cache ) )
				return i();
			
			// preload
			// NOTE: IE loads image right after defining the src
			var PB = this;
			var image = new Image();
			image.onload = function() {
				PB.cache.push( src );
				
				i();
			};
			image.src = src;
		},
		
		/**
		 * Put title
		 *
		 * Puts title from image's title attribute in Photobox header.
		 *
		 * @param int n - Index of the image.
		 */
		title: function( n ) {
			var title = this.$items.eq( n ).attr( 'title' );
			
			$( '#photobox .photobox-title span' ).text( title );
		},
		
		/**
		 * Clean up
		 */
		cleanup: function() {
			// so far
			$( '#photobox' ).remove();
		},
		
		/**
		 * Setup
		 */
		setup: function() {
			this.cleanup();
			
			var PB = this;
			
			// general
			$( 'body' ).append(
				$( '<div />' ).attr( 'id', 'photobox' ).css( 'opacity', 0 ).append(
					$( '<div />' ).addClass( 'photobox-title' ).append(
						$( '<span />' )
					).add( $( '<div />' ).addClass( 'photobox-controls' ).append(
						$( '<a />' ).attr( 'href', '#' ).addClass( 'photobox-button-prev' ).append(
							$( '<span />' )
						)
						.add( $( '<a />' ).attr( 'href', '#' ).addClass( 'photobox-button-close' ).append(
							$( '<span />' )
						) )
						.add( $( '<a />' ).attr( 'href', '#' ).addClass( 'photobox-button-next' ).append(
							$( '<span />' )
						) )
					) )
					.add( $( '<div />' ).addClass( 'photobox-wrapper' ) )
				)
			);
			
			// placeholders
			for( var i = 0; i < this.items.length; i++ )
				$( '#photobox .photobox-wrapper' ).append(
					$( '<div />' ).addClass( 'photobox-placeholder' )
				);
			
			this.controls();
			this.keys();
			this.touchable();
			
			// toggle controls
			$( '.photobox-wrapper' ).bind( 'tap click', function( e ) {
				PB.toggle_meta();
			} );
		},
		
		/**
		 * Map the controls
		 */
		controls: function() {
			var PB = this;
			
			$( '#photobox .photobox-button-prev' ).click( function( e ) {
				e.preventDefault();
				
				PB.prev();
			} );
			$( '#photobox .photobox-button-next' ).click( function( e ) {
				e.preventDefault();
				
				PB.next();
			} );
			$( '#photobox .photobox-button-close' ).click( function( e ) {
				e.preventDefault();
				
				PB.close();
			} );
		},
		
		/**
		 * Map keys
		 */
		keys: function() {
			var PB = this;
			
			$( document ).keydown( function( e ) {
				PB.fadeout_meta();
				
				switch( e.keyCode ) {
					// left
					case 37:
						PB.prev();
						break;
					
					// right
					case 39:
						PB.next();
						break;
					
					// esc
					case 27:
						PB.close();
						break;
				}
			} );
		},
		
		/**
		 * Enable touch support
		 *
		 * Supports swipe and zoom.
		 */
		touchable: function() {
			var PB = this,
				offsetX = 0,
				startX = 0,
				width = $( window ).width();
			
			// swipe
			$( '#photobox .photobox-wrapper' ).bind( 'touchstart', function( e ) {
				$( this ).removeClass( 'animate' );
				
				offsetX = $( this ).position().left;
				startX = e.originalEvent.touches[0].pageX;
			} ).bind( 'touchmove', function( e ) {
				e.preventDefault();
				PB.fadeout_meta();
				
				console.log( 'touchmove', ( offsetX * -1 + ( startX - e.originalEvent.touches[0].pageX ) ) * -1 + 'px' );
				
				$( this ).css( 'left', ( offsetX * -1 + ( startX - e.originalEvent.touches[0].pageX ) ) * -1 + 'px' );
			} ).bind( 'touchend', function() {
				var n = Math.round( $( this ).position().left / width ) * -1;
				
				console.log( 'touchend', $( this ).position().left, width, $( this ).position().left / width, n );
				
				if( n < 0 )
					n = 0;
				if( n > PB.items.length - 1 )
					n = PB.items.length - 1;
				
				PB.current = n;
				PB.load( n );
				
				$( this ).addClass( 'animate' ).css( 'left', n * -100 + '%' );
			} );
			
			/* TODO:
			// zoom/pinch
			$( '#photobox .photobox-placeholder img' ).bind( 'gesturechange', function( e ) {
				var scale = e.originalEvent.scale;
				
				if( 0.5 > scale )
					scale = 0.5;
				
				$( this ).css( '-webkit-transform', 'scale( ' + scale + ' )' );
			} );
			*/
		},
		
		/**
		 * Open
		 *
		 * @param int n - ( optional ) Index of item to show
		 */
		open: function( n ) {
			this.setup();
			
			// hide toolbar on iOS
			//window.scrollTo( 0, 1 );
			
			// offset to current
			this.current = n;
			var offset = this.current * 100 * -1;
			$( '#photobox .photobox-wrapper' ).css( 'left', offset + '%' );
			
			// load image
			this.load( n );
			
			// animate
			$( '#photobox' ).animate( { opacity: 1 }, 100 );
		},
		
		/**
		 * Close
		 */
		close: function() {
			// so far
			this.cleanup();
		},
		
		/**
		 * Prev
		 */
		prev: function() {
			this.current--;
			
			if( 0 > this.current )
				this.current = 0;
			
			this.load( this.current );
			
			// calc offset
			var offset = this.current * 100 * -1;
			
			// animate
			$( '.photobox-wrapper' ).addClass( 'animate' ).css( 'left', offset + '%' );
		},
		
		/**
		 * Next
		 */
		next: function() {
			this.current++;
			
			if( this.items.length - 1 < this.current )
				this.current = this.items.length - 1;
			
			this.load( this.current );
			
			// calc offset
			var offset = this.current * 100 * -1;
			
			/*
			var last = ( this.items.length - 1 ) * 100 * -1;
			
			// TODO: last
			if( offset == last )
				offset = last;*/
			
			$( '.photobox-wrapper' ).addClass( 'animate' ).css( 'left', offset + '%' );
		},
		
		/**
		 * Toggle meta
		 *
		 * TODO: figure out better implementation
		 */
		toggle_meta: function() {
			$( '#photobox .photobox-title, #photobox .photobox-controls' ).fadeToggle( 100 );
		},
		
		/**
		 * Fade out meta
		 *
		 * TODO: figure out better implementation
		 */
		fadeout_meta: function() {
			$( '#photobox .photobox-title, #photobox .photobox-controls' ).fadeOut( 100 );
		}
	};
	
	//Photobox.defaults = Photobox.prototype.defaults;
	
	/**
	 * jQuery plugin
	 *
	 * @param object options - Options
	 */
	$.fn.photobox = function( options ) {
		new Photobox( this, options ).init();
		
		return this;
	};
	
	//window.Photobox = Photobox;
} )( jQuery, window, document );