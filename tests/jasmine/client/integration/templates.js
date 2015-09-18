/* eslint func-names: 0 */
/* global
  $: false,
  Blaze: false,
  describe: false,
  expect: false,
  it: false
*/
'use strict';

describe('templates', function() {
  describe('uaForm', function() {
    it('should exist', function() {
      expect(Template.uaForm).toBeDefined();
    });

    it('should contain a div with ua-form class', function() {
      var div = document.createElement('DIV');
      Blaze.render(Template.uaForm, div);
      expect($(div).find('div.ua-form').length).toBe(1);
    });
  });

  describe('uaFullPageForm', function() {
    it('should exist', function() {
      expect(Template.uaFullPageForm).toBeDefined();
    });
  });
});
