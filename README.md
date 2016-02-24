# msg-js-spa-framework

JavaScript SinglePageApp(SPA) Framework is a lightweight framework for building SPA libraries.

<p/>
<img src="https://nodei.co/npm/msg-js-spa-framework.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/msg-systems/msg-js-spa-framework.png" alt=""/>

## Purpose
Major goals are:

- Definition of a standard set of frameworks used for SPA development
- Using the `msg-js-spa-framework` should therefor minimize the configuration time of the SPA library building in concrete SPA projects    

## Getting started

To build an SPA project based on `msg-js-spa-framework` you have to install it via npm (shell or package.json):

```shell
npm install msg-js-spa-framework --save-dev
```

Once it is installed, add a `delivery.yaml` to the SPA's root folder:

```yaml
import:
# use the msg-js-spa-framework as base
- msg-js-spa-framework
# you might add new delivery parts needed by the SPA project
- {path_to_project_deliverables}/**/*.yaml

build:
# you might exclude deliverables from the msg-js-spa-framwork if you want/have to (note they all start with spa-fw.)
- "!spa-fw.componentjs"
# and add proper replacements on your own - just ensure that those alias names are registered
- {yournamespace}.angularjs
```

If that `delivery.yaml` is fully configured - run the `delivery-packer` either with the grunt plugin or with the command line interface (see [delivery-packer](https://github.com/msg-systems/delivery-packer)).

Include the artifact output of the `delivery-packer` into your SPA HTML file.

## Behind the scene
Single page applications needs to adress alot of tasks like:

- DOM-Manipulation
- HTML Markups
- HTML Styling using CSS
- Responsive Design
- Browser navigation
- Drag & Drop
- Browser differences and incompatibilities
- Internationalization
	- Dates
	- Numbers
	- Texts
- Error handling
- Keyboard control
- Touch and gesture control
- Symbols, icons and images
- UI Widgets
- and many more

You can cover most of the applications needs with a single framework like [AngularJS](https://angularjs.org/) or [ExtJS](https://www.sencha.com/products/extjs/#overview) but sometimes you want to cherry pick the best frameworks to address specific needs. Then you need to assemble your own library stack by hand. `msg-js-spa-framework` does exactly this for you.

`msg-js-spa-framework` is based upon [delivery-packer](https://github.com/msg-systems/delivery-packer) which handles the library artifact creation. Based on `delivery.yaml` files the delivery artifact can be assembled.

So basically `msg-js-spa-framework` only assembles the proper JavaScript frameworks to a delivery artifact. And due to the fact that [delivery-packer](https://github.com/msg-systems/delivery-packer) is modular - concrete SPA projects can take use of `msg-js-spa-framework` by simply importing it into their `delivery.yaml`.
 
## Standard set of frameworks 
In order to build up a library stack that covers most of the applications need we assemble the following frameworks
<table style="width:100%">
<tbody>
  <tr>
	<th>Task</th>
	<th>Relevanz</th>
	<th>Framework</th>
	<th>Version</th>
  </tr>
  <tr>
	<td rowspan="5">Browser incompatibilities</td>
	<td>JS</td>	
	<td><a href='https://www.npmjs.com/package/console-polyfill'><img src="https://nodei.co/npm/console-polyfill.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.2.2</td>
  </tr>
  <tr>
	<td>JS</td>	
	<td><a href='https://www.npmjs.com/package/es5-shim'><img src="https://nodei.co/npm/es5-shim.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.5.5</td>
  </tr>
  <tr>
	<td>JS</td>	
	<td><a href='https://www.npmjs.com/package/json-js'><img src="https://nodei.co/npm/json-js.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.1.2</td>
  </tr>
  <tr>
	<td>JS</td>	
	<td><a href='https://www.npmjs.com/package/Base64'><img src="https://nodei.co/npm/Base64.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.3.0</td>
  </tr>
  <tr>
	<td>CSS</td>	
	<td><a href='https://www.npmjs.com/package/normalize.css'><img src="https://nodei.co/npm/normalize.css.png?downloads=true&stars=true" alt=""/></a></td>
	<td>3.0.3</td>
  </tr>
  <tr>
	<td>Browser feature detection</td>
	<td>JS</td>
	<td><a href='https://www.npmjs.com/package/modernizr'><img src="https://nodei.co/npm/modernizr.png?downloads=true&stars=true" alt=""/></a></td>
	<td>3.3.1</td>
  </tr>
  <tr>
	<td>DOM-Manipulation</td>
	<td>JS</td>
	<td><a href='https://www.npmjs.com/package/jquery'><img src="https://nodei.co/npm/jquery.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.2.1</td>
  </tr>
  <tr>
	<td>Array handling</td>
	<td>JS</td>
	<td><a href='https://www.npmjs.com/package/lodash'><img src="https://nodei.co/npm/lodash.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.5.1</td>
  </tr>
  <tr>
	<td rowspan="4">Internationalization</td>
	<td>JS - Date</td>
	<td><a href='https://www.npmjs.com/package/moment'><img src="https://nodei.co/npm/moment.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.11.2</td>
  </tr>
  <tr>
	<td>JS - Number</td>
	<td><a href='https://www.npmjs.com/package/numeral'><img src="https://nodei.co/npm/numeral.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.5.3</td>
  </tr>
  <tr>
	<td>JS - String</td>
	<td><a href='https://www.npmjs.com/package/i18next'><img src="https://nodei.co/npm/i18next.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.2.0</td>
  </tr>
  <tr>
	<td>HTML DOM</td>
	<td><a href='https://www.npmjs.com/package/jquery-i18next'><img src="https://nodei.co/npm/jquery-i18next.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.0.14</td>
  </tr>
  <tr>
	<td>Keyboard control</td>
	<td>JS</td>
	<td><a href='https://www.npmjs.com/package/mousetrap'><img src="https://nodei.co/npm/mousetrap.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.5.3</td>
  </tr>
  <tr>
	<td>User Interface Component Architecture</td>
	<td>JS</td>
	<td><a href='https://www.npmjs.com/package/componentjs'><img src="https://nodei.co/npm/componentjs.png?downloads=true&stars=true" alt=""/></a><br>
	Additionally abstract classes for ComponentJS are provided<br>
	<ul>
	<li>controller: app.fw.abstract.ctrl</li>
	<li>model: app.fw.abstract.model</li>
	<li>view: app.fw.abstract.view</li>
	</ul>
	All of them provide an abstract layer for work with ComponentJS.
	</td>
	<td>1.2.7</td>
  </tr>
  <tr>
	<td>Business datamodel</td>
	<td>JS</td>
	<td><a href='https://www.npmjs.com/package/datamodeljs'><img src="https://nodei.co/npm/datamodeljs.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.2.2</td>
  </tr>
</tbody>
</table>