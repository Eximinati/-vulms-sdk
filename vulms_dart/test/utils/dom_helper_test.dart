import 'package:html/dom.dart';
import 'package:test/test.dart';
import 'package:vulms_dart/src/utils/dom_helper.dart';

void main() {
  group('closest()', () {
    group('class selector', () {
      test('finds parent with matching class', () {
        final child = Element.tag('span');
        child.classes.add('target-child');

        final parent = Element.tag('div');
        parent.classes.add('target');
        parent.append(child);

        final result = closest(child, '.target');
        expect(result, isNotNull);
        expect(result!.classes.contains('target'), isTrue);
      });

      test('finds grandparent with matching class', () {
        final grandchild = Element.tag('span');
        final child = Element.tag('div');
        child.append(grandchild);

        final parent = Element.tag('div');
        parent.classes.add('ancestor');
        parent.append(child);

        final result = closest(grandchild, '.ancestor');
        expect(result, isNotNull);
        expect(result!.classes.contains('ancestor'), isTrue);
      });

      test('returns null when no parent matches class', () {
        final child = Element.tag('span');
        final parent = Element.tag('div');
        parent.append(child);

        final result = closest(child, '.nonexistent');
        expect(result, isNull);
      });
    });

    group('id selector', () {
      test('finds parent with matching id', () {
        final child = Element.tag('span');
        final parent = Element.tag('div');
        parent.id = 'my-container';
        parent.append(child);

        final result = closest(child, '#my-container');
        expect(result, isNotNull);
        expect(result!.id, 'my-container');
      });

      test('returns null when no parent matches id', () {
        final child = Element.tag('span');
        final parent = Element.tag('div');
        parent.id = 'other';
        parent.append(child);

        final result = closest(child, '#nonexistent');
        expect(result, isNull);
      });
    });

    group('tag selector', () {
      test('finds parent with matching tag name', () {
        final child = Element.tag('span');
        final parent = Element.tag('div');
        parent.append(child);

        final result = closest(child, 'div');
        expect(result, isNotNull);
        expect(result!.localName, 'div');
      });

      test('finds specific ancestor tag in deep hierarchy', () {
        final deepChild = Element.tag('span');
        final middle = Element.tag('p');
        middle.append(deepChild);

        final top = Element.tag('section');
        top.append(middle);

        final result = closest(deepChild, 'section');
        expect(result, isNotNull);
        expect(result!.localName, 'section');
      });

      test('returns null when no parent matches tag', () {
        final child = Element.tag('span');
        final parent = Element.tag('div');
        parent.append(child);

        final result = closest(child, 'table');
        expect(result, isNull);
      });
    });

    group('nested elements', () {
      test('finds nearest matching ancestor', () {
        final child = Element.tag('span');

        final innerParent = Element.tag('div');
        innerParent.classes.add('inner');
        innerParent.append(child);

        final outerParent = Element.tag('div');
        outerParent.classes.add('outer');
        outerParent.append(innerParent);

        final result = closest(child, '.inner');
        expect(result, isNotNull);
        expect(result!.classes.contains('inner'), isTrue);
        expect(result.classes.contains('outer'), isFalse);
      });

      test('returns element itself is not checked (starts from parent)', () {
        final element = Element.tag('div');
        element.id = 'self-id';

        final result = closest(element, '#self-id');
        expect(result, isNull);
      });
    });

    group('selector with whitespace', () {
      test('trims whitespace from selector', () {
        final child = Element.tag('span');
        final parent = Element.tag('div');
        parent.id = 'spaced';
        parent.append(child);

        final result = closest(child, '  #spaced  ');
        expect(result, isNotNull);
        expect(result!.id, 'spaced');
      });
    });
  });
}
