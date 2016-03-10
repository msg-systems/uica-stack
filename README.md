# msg-js-spa-framework

JavaScript SinglePageApp(SPA) Framework is a lightweight framework for building SPA libraries.

<p/>
<img src="https://nodei.co/npm/msg-js-spa-framework.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/msg-systems/msg-js-spa-framework.png" alt=""/>

## Purpose
The `msg-js-spa-framework` is the optional large HTML5 Rich-Client
framework for providing common functionality to the applications, either
by itself or through embedded third-party libraries and frameworks.

Major goals are:

- Definition of a standard set of third-party libraries and frameworks used for SPA development
- Using the `msg-js-spa-framework` should therefor minimize the configuration time of the SPA library building in concrete SPA projects    

## Getting started

To build an SPA project based on `msg-js-spa-framework` you have to install it via npm (shell or package.json):

```shell
npm install msg-js-spa-framework --save-dev
```

Once it is installed, add a `delivery.yaml` to the SPA's root folder. `msg-js-spa-framework` is based upon [delivery-packer](https://github.com/msg-systems/delivery-packer) which handles the library artifact creation. Based on `delivery.yaml` files the delivery artifact can be assembled.

So basically `msg-js-spa-framework` only assembles the proper JavaScript frameworks to a delivery artifact. And due to the fact that [delivery-packer](https://github.com/msg-systems/delivery-packer) is modular - concrete SPA projects can take advantage of `msg-js-spa-framework` by simply importing it into their `delivery.yaml`.
 

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

Creating an UI Application typically considers all functional requirements and tries to map those to an technical - *developable* - view. 

Typical functional requirements and a possible layer concept as a technical view will be detailed further below. 

### UI functional requirements
Single page applications face alot of functional requirements like:

- DOM-Manipulation
- HTML Markups
- HTML Styling using CSS
- Responsive Design
- Browser navigation
- Drag & Drop
- Browser differences and incompatibilities
- Internationalization / Localization
	- Dates
	- Numbers
	- Texts
- Error handling
- Keyboard control
- Touch and gesture control
- Symbols, icons and images
- UI Widgets
- and many more

### 12 layers of an UI application

Coming from the users point of view and going thru the UI application until the backend takes over we face different layers of concern:

1.  __Interaction Concept__:<br>
    e.g. Mouse, Keyboard, Touchscreen, Gesture, Dialog Flow

2.  __Optical Theme__:<br>
    e.g. Shape, Color, Gradient, Shadow, Font, Icon

3.  __Interface States__:<br>
    e.g. Rendered, Enabled, Visible, Focused, Animated, Warning, Error

4.  __Interface Elements__:<br>
    e.g. Icon, Label, Text Paragraph, Image, Form, Text-Field, Text-Area, 
    Date Picker, Toggle, Radio Button, Checkbox, Select List, Slider, 
    Progress Bar, Hyperlink, Popup Menu, Dropdown Menu, Toolbar, Tab, 
    Pill, Breadcrumb, Pagination, Badge, Alert

5.  __Interface Layouting__:<br>
    e.g. Responsive Design, Media Query, Panel, Modal, Frame, Grid, Table,
    Padding, Border, Margin, Alignment, Force, Magnetism

6.  __Mask Rendering__:<br>
    e.g. Markup Generation, Value Formatting, Virtual DOM

7.  __Data Binding__:<br>
    e.g. Reactive, Observer, Value Converting, Unidirectional, 
    Bidirectional, Incremental

8.  __Presentation Model__:<br>
    e.g. Parameter, Command, State, Data, Event

9.  __Dialog Control__:<br>
    e.g. Service, Event, Model, Socket

10. __Dialog Structure__:<br>
    e.g. Model, View, Controller, Hierarchical Composition

11. __Business Model__:<br>
    e.g. Entity, Field, Relationship

12. __Backend Communication__:<br>
    e.g. Request/Response, Synchronization, Push, Pull, Pulled-Push

Using a single framework like [AngularJS](https://angularjs.org/) or [ExtJS](https://www.sencha.com/products/extjs/#overview) often does not adress all layers of the UI application and you end up in taking other third party libraries into your application. 

## Standard set of frameworks 

`msg-js-spa-framework` cherry picks the best frameworks to cover most of the layers. Some layers will not be handled by `msg-js-spa-framework` since they are too application specific and should not be handled globally like 'Interface Elements' or 'Optical Theme'. 

Each concrete SPA must fill this layers with proper libraries or frameworks on its own. Take a look at [msg-js-spa-widgets](https://github.com/msg-systems/msg-js-spa-widgets) if you need assistance for layer 'Interface Elements' and 'Optical Theme'.

The following table lists all frameworks and libraries mapped to the 12 UI layers (technical view). Some libraries could not be mapped to a specific UI layer since they cover a global purpose needed by web applications like browser incompatibilities or JavaScript language basics.

<table style="width:100%">
<tbody>
  <tr>
	<th width="50%">Framework</th>
	<th width="10%">Version</th>
	<th width="10%">Relevance</th>
	<th>global purpose</th>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/console-polyfill'><img src="https://nodei.co/npm/console-polyfill.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.2.2</td>
	<td>JS</td>	
	<td rowspan="5">Browser incompatibilities</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/es5-shim'><img src="https://nodei.co/npm/es5-shim.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.5.7</td>
	<td>JS</td>	
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/json-js'><img src="https://nodei.co/npm/json-js.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.1.2</td>
	<td>JS</td>	
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/Base64'><img src="https://nodei.co/npm/Base64.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.3.0</td>
	<td>JS</td>	
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/normalize.css'><img src="https://nodei.co/npm/normalize.css.png?downloads=true&stars=true" alt=""/></a></td>
	<td>3.0.3</td>
	<td>CSS</td>	
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/modernizr'><img src="https://nodei.co/npm/modernizr.png?downloads=true&stars=true" alt=""/></a></td>
	<td>3.3.1</td>
	<td>JS</td>
	<td>Browser feature detection</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/lodash'><img src="https://nodei.co/npm/lodash.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.6.1</td>
	<td>JS</td>
	<td>Array handling</td>
  </tr>
</tbody>
</table>

<table style="width:100%">
<tbody>
  <tr>
	<th width="50%">Framework</th>
	<th width="10%">Version</th>
	<th width="10%">Relevance</th>
	<th>Layer</th>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/mousetrap'><img src="https://nodei.co/npm/mousetrap.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.5.3</td>
	<td>JS</td>
	<td>1. Interaction Concept - Keyboard</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/hammerjs'><img src="https://nodei.co/npm/hammerjs.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.0.6</td>
	<td>JS</td>
	<td>1. Interaction Concept - Touch, Gesture</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/jquery'><img src="https://nodei.co/npm/jquery.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.2.1</td>
	<td>JS</td>
	<td>3. Interface States<br>6. Mask Rendering<br>7. Data Binding</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/jquery-markup'><img src="https://nodei.co/npm/jquery-markup.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.0.35</td>
	<td>JS</td>
	<td>6. Mask Rendering</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/handlebars'><img src="https://nodei.co/npm/handlebars.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.0.5</td>
	<td>JS</td>
	<td>6. Mask Rendering - Template engine</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/moment'><img src="https://nodei.co/npm/moment.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.12.0</td>
	<td>JS - Date</td>
	<td>6. Mask Rendering - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/numeral'><img src="https://nodei.co/npm/numeral.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.5.3</td>
	<td>JS - Number</td>
	<td>6. Mask Rendering - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/i18next'><img src="https://nodei.co/npm/i18next.png?downloads=true&stars=true" alt=""/></a></td>
	<td>2.3.3</td>
	<td>JS - String</td>
	<td>6. Mask Rendering - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/i18next-xhr-backend'><img src="https://nodei.co/npm/i18next-xhr-backend.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.5.3</td>
	<td>JS - String</td>
	<td>12. Backend Communication - Internationalization / Localization</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/jquery-i18next'><img src="https://nodei.co/npm/jquery-i18next.png?downloads=true&stars=true" alt=""/></a></td>
	<td>0.1.1</td>
	<td>HTML DOM</td>
	<td>6. Mask Rendering - Internationalization / Localization</td>
  </tr>
  <tr>
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
	<td>JS</td>
	<td>8. Presentation Model<br>9. Dialog Control<br>10. Dialog Structure</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/datamodeljs'><img src="https://nodei.co/npm/datamodeljs.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.2.5</td>
	<td>JS</td>
	<td>11. Business Model</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/qwest'><img src="https://nodei.co/npm/qwest.png?downloads=true&stars=true" alt=""/></a></td>
	<td>4.1.1</td>
	<td>JS</td>
	<td>12. Backend Communication - AJAX</td>
  </tr>
  <tr>
	<td><a href='https://www.npmjs.com/package/socket.io-client'><img src="https://nodei.co/npm/socket.io-client.png?downloads=true&stars=true" alt=""/></a></td>
	<td>1.4.5</td>
	<td>JS</td>
	<td>12. Backend Communication - WebSockets</td>
  </tr></tbody>
</table>