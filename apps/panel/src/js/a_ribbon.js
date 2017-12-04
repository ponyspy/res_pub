$(function() {
	$ribbon = $('.slider_block.ribbon .slider_inner');
	$pool = $('.slider_block.pool .slider_inner');

	var ribbon_sort = {
		placeholder: 'placeholder',
		axis: 'x',
		containment: 'document',
		cancel: '.option, .meta'
	};

	$ribbon.sortable(ribbon_sort);

	$('.media_item', '.slider_block.pool').draggable({
		cancel: '.option',
		revert: 'invalid',
		containment: 'document',
		zIndex: 100,
		helper: 'clone',
		cursor: 'move',
		connectToSortable: $ribbon,
	});

	$ribbon.droppable({
		drop: function(event, ui) {
			ui.helper.find('.add_item').remove();
			ui.helper.append($('<div>', { 'class': 'option remove_item', 'text': '×'  }));
			ui.helper.removeAttr('style');
			ui.helper.children('.meta').remove().end().children('.add_meta').removeClass('hide');
		}
	});

	$(document)
		.on('click', '.remove_item', function(e) {
			$(this).parent().remove();
			$ribbon.sortable(ribbon_sort);
		})
		.on('click', '.add_item', function(e) {
			$(this).parent().clone()
						 .children('.add_item').addClass('hide').end()
						 .children('.remove_item, .add_meta').removeClass('hide').end()
						 .children('.meta').remove().end()
						 .appendTo($ribbon);

			$ribbon.sortable(ribbon_sort);
		})
		.on('click', '.add_meta', function(e) {
			var $duration =  $('<div/>', { 'class': 'meta duration', 'text': '3s' });
			var $interval =  $('<div/>', { 'class': 'meta interval', 'text': '24.09.17 - 28.09.17' });

			$(this).addClass('hide').parent().append($duration, $interval).children('.revert_meta').removeClass('hide');
		})
		.on('click', '.revert_meta', function(e) {
			$(this).addClass('hide').parent().children('.meta').remove().end()
																			 .children('.add_meta').removeClass('hide');
		});

});