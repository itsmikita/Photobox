/**
 * @file: photobox.js
 *
 * Author: Mikita Stankiewicz
 * URL: http://designed.bymikita.com/photobox/
 * Version: 0.4
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
		cache: [],
		items: [],
		current: 0,
		isGallery: true, // wether it is a single image or multiple
		defaults: {},
		options: {},
		config: {},
		
		/**
		 * Init
		 */
		init: function() {
			// config
			this.config = $.extend( {}, this.defaults, this.options );
			
			var self = this;
			
			this.$items.each( function( n ) {
				self.items.push( $( this ).attr( 'href' ) );
				
				$( this ).click( function( e ) {
					e.preventDefault();
					
					self.open( n );
				} );
			} );
		},
		
		/**
		 * Load image
		 *
		 * Loads selected item into Photobox.
		 *
		 * @param int n - Index of the item
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
			
			// do preload
			// NOTE: IE loads image right after defining the src
			var self = this;
			var image = new Image();
			image.onload = function() {
				self.cache.push( src );
				
				i();
			};
			image.src = src;
		},
		
		/**
		 * Title
		 *
		 * Puts title from image's title attribute in Photobox title.
		 *
		 * @param int n - Index of the item
		 */
		title: function( n ) {
			var title = this.$items.eq( n ).attr( 'title' );
			
			$( '#photobox .photobox-title span' ).text( title );
		},
		
		/**
		 * Clear
		 *
		 * Removes #photobox markup to avoid conflicts.
		 */
		clear: function() {
			// so far
			$( '#photobox' ).remove();
		},
		
		/**
		 * Setup
		 *
		 * Appends #photobox markup.
		 */
		setup: function() {
			this.clear();
			
			var self = this;
			
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
			/*$( '.photobox-wrapper' ).bind( 'click, tap', function( e ) {
				self.toggleMeta();
			} );
			$( '.photobox-wrapper' ).bind( 'mouseup', function( e ) {
				self.close();
			} )*/
		},
		
		/**
		 * Map the controls
		 */
		controls: function() {
			var self = this;
			
			$( '#photobox .photobox-button-prev' ).click( function( e ) {
				e.preventDefault();
				
				self.prev();
			} );
			$( '#photobox .photobox-button-next' ).click( function( e ) {
				e.preventDefault();
				
				self.next();
			} );
			$( '#photobox .photobox-button-close' ).click( function( e ) {
				e.preventDefault();
				
				self.close();
			} );
		},
		
		/**
		 * Map keys
		 */
		keys: function() {
			var self = this;
			
			$( document ).keydown( function( e ) {
				self.fadeoutMeta();
				
				switch( e.keyCode ) {
					// left
					case 37:
						self.prev();
						break;
					
					// right
					case 39:
						self.next();
						break;
					
					// esc
					case 27:
						self.close();
						break;
				}
			} );
		},
		
		/**
		 * Touch support
		 *
		 * Supports swipe and zoom/pinch.
		 */
		touchable: function() {
			var self = this,
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
				//self.fadeoutMeta();
				
				//$( this ).css( 'left', ( offsetX * -1 + ( startX - e.originalEvent.touches[0].pageX ) ) * -1 + 'px' );
				$( this ).css( '-webkit-transform', 'translateX(' + ( offsetX * -1 + ( startX - e.originalEvent.touches[0].pageX ) ) * -1 + 'px)' );
			} ).bind( 'touchend', function() {
				var n = Math.round( $( this ).position().left / width ) * -1;
				
				if( n < 0 )
					n = 0;
				if( n > self.items.length - 1 )
					n = self.items.length - 1;
				
				self.current = n;
				self.load( n );
				
				//$( this ).addClass( 'animate' ).css( 'left', n * -100 + '%' );
				$( this ).addClass( 'animate' ).css( '-webkit-transform', 'translateX(' + n * ( width * -1 ) + 'px)' );
			} );
			
			// Not working properly. TODO: Edit this
			// zoom/pinch
			$( '#photobox .photobox-placeholder img' ).bind( 'gesturechange', function( e ) {
				var scale = e.originalEvent.scale;
				
				if( 0.5 > scale )
					scale = 0.5;
				
				$( this ).css( '-webkit-transform', 'scale( ' + scale + ' )' );
			} );
		},
		
		/**
		 * Open
		 *
		 * @param int n - ( optional ) Index of the item to show
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
			this.clear();
		},
		
		/**
		 * Prev
		 *
		 * Show previuos image.
		 */
		prev: function() {
			if( ! this.isGallery )
				return false;
			
			this.current--;
			
			if( 0 > this.current )
				this.current = 0;
			
			this.load( this.current );
			
			// calc offset
			var offset = this.current * ( $( window ).width() * -1 );
			
			// animate
			//$( '.photobox-wrapper' ).addClass( 'animate' ).css( 'left', offset + '%' );
			$( '.photobox-wrapper' ).addClass( 'animate' ).css( '-webkit-transform', 'translateX(' + offset + 'px)' );
		},
		
		/**
		 * Next
		 *
		 * Show next image.
		 */
		next: function() {
			if( ! this.isGallery )
				return false;
			
			this.current++;
			
			if( this.items.length - 1 < this.current )
				this.current = this.items.length - 1;
			
			this.load( this.current );
			
			// calc offset
			var offset = this.current * ( $( window ).width() * -1 );
			
			/*
			var last = ( this.items.length - 1 ) * 100 * -1;
			
			// TODO: last
			if( offset == last )
				offset = last;*/
			
			//$( '.photobox-wrapper' ).addClass( 'animate' ).css( 'left', offset + '%' );
			$( '.photobox-wrapper' ).addClass( 'animate' ).css( '-webkit-transform', 'translateX(' + offset + 'px)' );
		},
		
		/**
		 * Toggle meta
		 *
		 * Toggles meta.
		 * TODO: figure out better implementation
		 */
		toggleMeta: function() {
			$( '#photobox .photobox-title, #photobox .photobox-controls' ).fadeToggle( 100 );
		},
		
		/**
		 * Fade out meta
		 *
		 * TODO: figure out better implementation
		 */
		fadeoutMeta: function() {
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