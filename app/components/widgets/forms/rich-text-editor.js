import $ from 'jquery';
import Component from '@ember/component';
import { debounce } from '@ember/runloop';
import { observer, computed } from '@ember/object';
import { v4 } from 'ember-uuid';
import { isTesting } from 'open-event-frontend/utils/testing';
import Ember from 'ember';

export default Component.extend({

  editor: null,

  // Ensure any changes to the parser rules are set in the sanitizer @ services/sanitizer.js
  standardParserRules: {
    tags: {
      'p'      : 1,
      'b'      : { 'rename_tag': 'strong' },
      'strong' : 1,
      'i'      : { 'rename_tag': 'em' },
      'em'     : 1,
      'u'      : 1,
      'ol'     : 1,
      'li'     : 1,
      'ul'     : 1,
      'br'     : 1,
      'a'      : {
        'check_attributes': {
          'href': 'url'
        },
        'set_attributes': {
          'rel'    : 'nofollow',
          'target' : '_blank'
        }
      }
    }
  },

  valueObserver: observer('value', function() {
    if (this.editor && this.editor.getValue() !== this.value) {
      this.editor.setValue(this.value);
    }
  }),

  textareaIdGenerated: computed('textareaId', function() {
    return this.textareaId ? this.textareaId : v4();
  }),

  didInsertElement() {
    this._super(...arguments);
    this.set('_value', this.value);
    $('.button', this.element)
      .popup({
        inline    : true,
        variation : 'tiny'
      });

    // Don't initialize wysihtml5 when app is in testing mode
    if (!isTesting) {
      this.editor = new wysihtml5.Editor($(`#${this.textareaIdGenerated}`, this.element)[0], {
        toolbar     : $(`#${this.textareaIdGenerated}-toolbar`, this.element)[0],
        parserRules : this.standardParserRules
      });

      const updateValue = () => {
        debounce(this, () => {
          const value = String(this.editor.getValue()).replace(/(<br>)*$/g, '');
          this.setProperties({ _value: value, value });
        }, 200);
      };

      this.editor.on('interaction', updateValue);
      this.editor.on('aftercommand:composer', updateValue);
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    if (this.editor) {
      this.editor.destroy();
    }
    $('.button', this.element).popup('destroy');
  },

  enabled           : false, // whether recognition is enabled
  speechRecognition : null, // the instance of webkitSpeechRecognition
  language          : 'en', // language to recognise
  startRecognition() {
    // prefixed SpeechRecognition object because it only works in Chrome
    const speechRecognition = new webkitSpeechRecognition();
    // not continuous to avoid delays
    speechRecognition.continuous = false;
    // only the final result
    speechRecognition.interimResults = false;
    // the recognition language
    speechRecognition.lang = this.get('language');
    // binding various handlers
    speechRecognition.onresult = Ember.run.bind(this, this.onRecoginitionResult);
    speechRecognition.onend = Ember.run.bind(this, this.onRecognitionEnd);
    // starting the recognition
    speechRecognition.start();
  },
  onRecognitionEnd() {
    this.set('enabled', false);
  },

  onRecoginitionResult(e) {
    let result = '';
    const resultNo = 0;
    const alternativeNo = 0;
    // we get the first alternative of the first result
    result = e.results[resultNo][alternativeNo].transcript;
    // report the result to the outside

    const tmpSpeech = this.value + result;
    console.log(this.value);
    console.log(result);
    // this.value = tmpSpeech;
    this.set('value', tmpSpeech);
    this.sendAction('onResult', result);
  },

  onEnabledChange: function() {
    if (this.get('enabled')) {
      this.startRecognition();
    }
  }.observes('enabled'),
  actions: {
    toggle() {
      this.toggleProperty('enabled');
    }
  }
});
