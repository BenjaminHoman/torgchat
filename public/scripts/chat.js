
Vue.component('input-text-cmp', {
	template: 
	`<div class="form__group field">
  		<input type="input" class="form__field" placeholder="Message" name="message" id='message' required />
  		<label for="message" class="form__label">Message</label>
	</div>`
});

Vue.component('edit-message-box', {
	data: function(){
		return {
			message: "a message"
		}
	},
	template: 
		`<div>
			<input-text></input-text>
		</div>`
});

$(document).ready(function(){
	var chatApp = new Vue({
		el: "#chat"
	});
});