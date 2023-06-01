(function () {
  var ElementPrototype = window.Element.prototype;
  var DocumentPrototype = window.Document.prototype;
  var DocumentFragmentPrototype = window.DocumentFragment.prototype;

  if (!ElementPrototype.prepend || !DocumentPrototype.prepend || !DocumentFragmentPrototype.prepend) {
    ElementPrototype.prepend =
      DocumentPrototype.prepend =
      DocumentFragmentPrototype.prepend =
        function () {
          var argArr = window.Array.prototype.slice.call(arguments);
          var docFrag = window.document.createDocumentFragment();

          argArr.forEach(function (argItem) {
            var isNode = argItem instanceof window.Node;
            docFrag.appendChild(isNode ? argItem : document.createTextNode(window.String(argItem)));
          });
          this.insertBefore(docFrag, this.firstChild);
        };
  }
})();
