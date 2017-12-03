$(function() {
	$ribbon = $('.slider_block.ribbon .slider_inner');
	$pool = $('.slider_block.pool .slider_inner');

	var ribbon_sort = {
		placeholder: 'placeholder',
		axis: 'x',
		containment: 'document',
		// cancel: '.add_item',
		// connectWith: '.column_articles',
		// forcePlaceholderSize: true,
		// forceHelperSize: true,
		// sort: function(e) {

		// }
	};

	$ribbon.sortable(ribbon_sort);


	$('.media_item', '.slider_block.pool').draggable({
		// cancel: 'a.ui-icon',
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
		}
	});


	$(document).on('click', '.remove_item', function(e) {
		$(this).parent().remove();
		$ribbon.sortable(ribbon_sort);
	});

	$(document).on('click', '.add_item', function(e) {
		$(this).parent().clone()
					 .find('.add_item').remove().end()
					 .append($('<div>', { 'class': 'option remove_item', 'text': '×'  }))
					 .prependTo($ribbon);

		$ribbon.sortable(ribbon_sort);
	});

});