import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import Component from '@ember/component';
import waitFor from '@ember/test-helpers/dom/wait-for';

@classic
export default class NavBar extends Component {
  @computed('session.currentRouteName')
  get isNotEventPageRoute() {
    return !(String(this.session.currentRouteName).includes('public'));
  }

  @computed('session.currentRouteName')
  get isNotWizardPageRoute() {
    return !(String(this.session.currentRouteName).includes('edit'))
    && String(this.session.currentRouteName) !== 'create';
  }

  @computed('session.currentRouteName')
  get isNotExplorePageRoute() {
    return !(String(this.session.currentRouteName).includes('explore'));
  }

  @action
  handleKeyPress() {
    if (event.keyCode === 13 || event.which === 13) {
      this.search();
      document.querySelector('#mobile-bar').classList.remove('show-bar');
      document.getElementById('mobileSearchBar').blur();
    }
  }

  @action
  searchOnClick() {
    this.sendAction('search');
    document.querySelector('#mobile-bar').classList.remove('show-bar');
  }

  @action
  toggleSearchBar() {
    document.querySelector('#mobile-bar').classList.toggle('show-bar');
  }

  @action
  toggleMobileSearchBar() {
    const mobileBar = document.getElementById('mobile-bar');
    const mobileSearchBar = document.getElementById('mobileSearchBar');
    mobileBar.classList.add('show-bar');
    mobileSearchBar.focus();
    startDictationSmall();
    document.querySelector('.pusher').addEventListener('click', function(e) {
      if (e.target === mobileSearchBar) {
        return;
      }
      mobileBar.classList.remove('show-bar');
    });
  }

  @action
  logout() {
    this.authManager.logout();
    this.routing.transitionTo('index');
  }
}

function startDictationSmall() {

  if (window.hasOwnProperty('webkitSpeechRecognition')) {

    //alert("Hello world");

    var recognition = new webkitSpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function (e) {
      document.getElementById("mobileSearchBar").value
        = e.results[0][0].transcript;
      recognition.stop();
    };

    recognition.onerror = function (e) {
      recognition.stop();
    }

  }
}

