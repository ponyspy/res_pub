$(function() {

	var context = { skip: 10, limit: 10 };

	$(document)
		.on('click', '.list_back', function() {
			var $list = $('.list_select');

			$list[0].selectedIndex = $list.children('option:selected').val() != 0
				? $list.children('option:selected').prev().val()
				: $list.children('option').last().val();
			$list.trigger('change');
		})

		.on('click', '.list_next', function() {
			var $list = $('.list_select');

			$list[0].selectedIndex = $list.children('option:selected').next().val();
			$list.trigger('change');
		})

		.on('change', '.list_select', function(event) {
			context.skip = $('.list_select option:selected').val() * 10;

			$.post('', {context: context}).done(function(data) {
				if (data == 'end') return false;
				$('.lists_block').empty().append(data);
			});
		});

	$('.drop_item').on('click', function() {
		var $this = $(this);
		var item = $this.closest('.sub_drop').attr('class').split(' ')[1];
		context[item] = $this.attr('class').split(' ')[1];

		$this.parent('.drop_inner').children('.drop_item').removeClass('select').filter(this).addClass('select');

		context.skip = 0;
		$.post('', {context: context}).done(function(data) {
			if (data == 'end') {
				$('.lists_block').empty().text('Ничего нет!');
			} else {
				$('.lists_block').empty().append(data);
				context.skip = 10;
			}
		});
	});


	// -- Keys


	$(document).on('keyup', function(event) {
		if (event.altKey && event.which == 70) {
			$('.sub_search').focus();
			return false;
		}

		if (event.which == 27) {
			var $sub_search = $('.sub_search');
			$sub_search.val() === ''
				? $sub_search.blur()
				: $sub_search.val('').trigger('keyup');
			return false;
		}

		if (event.which == 39) {
			$('.list_next').trigger('click');
			return false;
		}

		if (event.which == 37) {
			$('.list_back').trigger('click');
			return false;
		}
	});


	// -- Search text


	var search = {
		val: '', buf: '',
		checkResult: function() {
			if (this.buf != this.val) {
				this.buf = this.val;
				this.getResult.call(search, this.val);
			}
		},
		getResult: function (result) {
			context.skip = 0;
			context.text = result;

			$.post('', { context: context }).done(function(data) {
				if (data == 'end') {
					$('.lists_block').empty().text('Ничего нет!');
				} else {
					$('.lists_block').empty().append(data);
					context.skip = 10;
				}
			});
		}
	};

	$('.sub_search')
		.on('keyup change', function(event) {
			search.val = $(this).val();
		})
		.on('focusin', function(event) {
			search.interval = setInterval(function() {
				search.checkResult.call(search);
			}, 600);
		})
		.on('focusout', function(event) {
			clearInterval(search.interval);
		});


	// -- Search local


	$(document).on('keyup change', '.sub_search.local', function(event) {
		var value = $(this).val().toLowerCase();

		$('.list_item').children('.item_title').each(function() {
			var $elem = $(this);

			$elem.html().toLowerCase().indexOf(value) != -1
				? $elem.parent().show()
				: $elem.parent().hide();
		});
	});


	// -- Preview


	$('.toggle_preview').on('click', function() {
		$('.item_preview').toggleClass('show');
	});


	// -- Copy


	$('.toggle_copy').on('click', function() {
		$('.item_copy').toggleClass('show');
	});

	$(document).on('click', '.item_copy', function(e) {
		var id = $(this).parent().attr('id');

		if (confirm('Скопировать ленту?')) {
			$.post('/admin/ribbons/copy', {id: id}).done(function(data) {
				location.reload();
			});
		}
	});


	// -- Remove


	$('.toggle_rm').on('click', function() {
		$('.item_rm').toggleClass('show');
	});

	function remove (event) {
		var id  = $(this).parent().attr('id');
		var quotes = [
			'Быть собой мне мешает уголовный кодекс', 'Может не надо?',
			'Красивая фамилия - честные глаза', 'Хорошо — что никого',
			'Самую смертную связь', 'Спасибо мне что есть я у тебя',
			'Москва завалена арбузами', 'Я хочу быть автоматом',
			'Я воскрешаю деревья', 'Самоизвержение', 'Полиция нравов',
			'MTV - мировая термоядерная война', 'Этого еще не хватало',
			'Встречайте веру по утрам', 'Гриша', 'Библиотечный шик',
			'Как далеко до Тель-Авива', 'Не ко времени и не к месту',
			'Горечь горе, горечь грусть', 'Я люблю пюре', 'Морда лица',
			'Со скоростью света', 'За интеллект и дальше', 'Осенний торт',
			'Просвещение неизбежно', 'Работать в корзину, но не впустую',
			'Нравится тебе пирожок?', 'Рябину рубили зорькою',
			'Я зубная паста', 'Сделать просто - очень сложно',
			'Макс Фадеев - сестричка', 'Из ничего ничего и проистекает',
			'Науки неестественные', 'Науки противоестественные',
			'На стыке изотерм', 'Усложнения сложны', 'Науки естественные'
		];
		var quote = quotes[Math.floor(Math.random() * quotes.length)];
		var warning = '\n\n' + 'Для подтверждения введите фразу:' + '\n\n' + '«' + quote + '»';

		if (prompt(event.data.description + warning, '').trim().toLowerCase().replace(/«|»/g, '') == quote.toLowerCase()) {
			$.post(event.data.path, {'id': id}).done(function(data) {
				if (data == 'current_user') {
					document.location.pathname = '/auth/logout';
				} else {
					location.reload();
				}
			});
		}
	}

	$(document)
		.on('click', '.item_rm.user', {path:'/admin/users/remove', description: 'Удалить пользователя?'}, remove)
		// .on('click', '.item_rm.place', {path:'/admin/places/remove', description: 'Удалить локацию?'}, remove)
		.on('click', '.item_rm.ribbon', {path:'/admin/ribbons/remove', description: 'Удалить ленту?'}, remove)
		.on('click', '.item_rm.ad', {path:'/admin/ads/remove', description: 'Удалить объявление?'}, remove)

});