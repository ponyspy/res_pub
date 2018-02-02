$(function() {
	$('.places_select').on('click', function(e) {
		$('.places_block').toggleClass('show');
	});

	$('.reboot').on('click', function(e) {
		location.reload();
	});


	$(document)
		.on('click', '.places_connect.active', function(e) {
			var device = $('.places_list.device').children('.active').text();

			$('.place_title').text(device);
		})
		.on('click', '.p_title', function(e) {
			var $this = $(this);

			$this.nextAll().addBack().remove();
			$('.places_connect').removeClass('active');

			if ($this.hasClass('shop')) {
				$('.places_list.device').nextAll('.places_list').addBack().hide();
			}

			if ($this.hasClass('city')) {
				$('.places_list.shop').nextAll('.places_list').addBack().hide();
			}

			if ($this.hasClass('device')) {
				$('.places_list.device').children().removeClass('active');
				$('.places_connect').removeClass('active');
			}
		})
		.on('click', '.list_item', function(e) {
			var $this = $(this);

			if ($this.parent().hasClass('city')) {
				var $title = $('<div/>', {'class': 'p_title city', 'text': $this.text() });

				$('.places_title').append($title);
				$('.places_list.shop').show();
			}

			if ($this.parent().hasClass('shop')) {
				var $title = $('<div/>', {'class': 'p_title shop', 'text': $this.text() });

				$('.places_title').append($title);
				$('.places_list.device').show();
			}

			if ($this.parent().hasClass('device')) {
				var $title = $('<div/>', {'class': 'p_title device', 'text': $this.text() });

				$('.places_title').children('.device').remove().end().append($title);
				$('.places_list.device').children().removeClass('active').filter(this).addClass('active');
				$('.places_connect').addClass('active');
			}
		});
});