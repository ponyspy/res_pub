$(function() {
	$('.places_select').on('click', function(e) {
		$('.places_block').toggleClass('show');
	});

	$('.reboot').on('click', function(e) {
		location.reload();
	});


	$(document)
		.on('click', '.places_connect.active', function(e) {
			var device = $('.places_list').children('.active').text();

			$('.place_title').text(device);
		})
		.on('click', '.p_title', function(e) {
			var $this = $(this);

			var place_type = $this.attr('place_type');
			var place_id = $this.prev().attr('place_id');

			$this.nextAll().addBack().remove();
			$('.places_connect').removeClass('active');

			if (place_type == 'shop' || place_type == 'city') {
				$.post('', { 'parent': place_id }).done(function(data) {
					$('.places_list').empty().append(data);
				});
			} else if (place_type == 'device') {
				$('.places_list').children().removeClass('active');
				$('.places_connect').removeClass('active');
			}
		})
		.on('click', '.place_item', function(e) {
			var $this = $(this);

			var place_type = $this.attr('place_type');
			var place_id = $this.attr('place_id');

			var $title = $('<div/>', {'class': 'p_title', 'place_type': place_type, 'place_id': place_id, 'text': $this.text() });

			if (place_type == 'city' || place_type == 'shop') {
				$.post('', { 'parent': place_id }).done(function(data) {
					$('.places_title').append($title);
					$('.places_list').empty().append(data);
				});
			} else if (place_type == 'device') {
				$('.places_title').children('[place_type=device]').remove().end().append($title);
				$('.places_list').children().removeClass('active').filter(this).addClass('active');
				$('.places_connect').addClass('active');
			}
		});
});