(function(PLUGIN_ID) {
	'use strict';

	const c = {
		templateAppId: '',
		templateNameFieldCode: '',
		ccFieldCode: '',
		bccFieldCode: '',
		subjectFieldCode: '',
		bodyFieldCode: '',
		emailFieldCode: '',
		//...kintone.plugin.app.getConfig(PLUGIN_ID)	// if modify key, 
	};
	Object.entries(
		kintone.plugin.app.getConfig(PLUGIN_ID)
	)
	.forEach(
		([k, v]) => c.hasOwnProperty(k) && (c[k] = v)
	);

	const l = kintone.getLoginUser().language;

	document.querySelector('section.settings').innerHTML = /* html */`
		<h1 class="settings-heading">
			${{
				ja: 'メールテンプレート',
				en: 'Settings for Email template',
				zh: '邮件模板'
			}[l]}
		</h1>
		<p class="kintoneplugin-desc"></p>
		<form name="settings">
			<h3>
				${{
					ja: 'メールテンプレートアプリの',
					en: 'Email template app',
					zh: '电子邮件模板应用程序'
				}[l]}
			</h3>
			<p class="kintoneplugin-row">
				<label for="templateAppId">
					${{
						ja: 'アプリ',
						en: 'App ',
						zh: '应用程序'
					}[l]}
					ID:
					<br />
					<input
						type="text"
						class="kintoneplugin-input-text"
						name="templateAppId"
						value="${c.templateAppId}"
						required />
				</label>
			</p>
			<p class="kintoneplugin-row">
				<label for="templateNameFieldCode">
					${{
						ja: 'テンプレート名フィールドコード',
						en: 'Template name field code',
						zh: '模板名称字段代码'
					}[l]}:
					<br />
					<input
						type="text"
						class="kintoneplugin-input-text"
						name="templateNameFieldCode"
						value="${c.templateNameFieldCode}"
						required />
				</label>
			</p>
			<p class="kintoneplugin-row">
				<label for="ccFieldCode">
					CC
					${{
						ja: 'フィールドコード',
						en: ' field code',
						zh: '段代码'
					}[l]}:
					<br />
					<input
						type="text"
						class="kintoneplugin-input-text"
						name="ccFieldCode"
						value="${c.ccFieldCode}" />
				</label>
			</p>
			<p class="kintoneplugin-row">
				<label for="bccFieldCode">
				BCC
				${{
					ja: 'フィールドコード',
					en: ' field code',
					zh: '段代码'
				}[l]}:
				<br />
				<input
					type="text"
					class="kintoneplugin-input-text"
					name="bccFieldCode"
					value="${c.bccFieldCode}" />
				</label>
			</p>
			<p class="kintoneplugin-row">
				<label for="subjectFieldCode">
					${{
						ja: '件名フィールドコード',
						en: 'Subject field code',
						zh: '主题字段代码'
					}[l]}:
					<br />
					<input
						type="text"
						class="kintoneplugin-input-text"
						name="subjectFieldCode"
						value="${c.subjectFieldCode}" />
				</label>
			</p>
			<p class="kintoneplugin-row">
				<label for="bodyFieldCode">
					${{
						ja: '本文フィールドコード',
						en: 'Body field code',
						zh: '正文字段代码'
					}[l]}:
					<br />
					<input
						type="text"
						class="kintoneplugin-input-text"
						name="bodyFieldCode"
						value="${c.bodyFieldCode}" />
				</label>
			</p>
			<br />
			<h3>
				${{
					ja: 'このアプリの',
					en: 'This App',
					zh: '这个应用程序'
				}[l]}
			</h3>
			<br />
			<p class="kintoneplugin-row">
				<label for="emailFieldCode">
					${{
						ja: 'メールアドレスフィールドコード',
						en: 'Email address field code',
						zh: '电子邮件地址字段代码'
					}[l]}:
					<br />
					<!--select class="js-text-emailFieldCode kintoneplugin-dropdown" required></select-->
					<input
						type="text"
						class="kintoneplugin-input-text"
						name="emailFieldCode"
						value="${c.emailFieldCode}"
						requied />
				</label>
			</p>
			<p class="kintoneplugin-row">
				<button type="button" name="cancel" class="kintoneplugin-button-dialog-cancel">
					${{
						ja: 'キャンセル',
						en: 'Cancel',
						zh: '取消'
					}[l]}
				</button>
				<button type="submit" class="kintoneplugin-button-dialog-ok">
					${{
						ja: '保存',
						en: 'Save',
						zh: '节省'
					}[l]}
				</button>
			</p>
		</form>
	`;

	document.forms.settings.elements.cancel.onclick = () => window.location.href = `../../${kintone.app.getId()}/plugin/`;
	document.forms.settings.onsubmit = (event) => {
		event.preventDefault();
		kintone.plugin.app.setConfig(
			Object.fromEntries(
				Object.entries(c)
				.map(([k, _]) => ([k, document.forms.settings.elements[k].value || '']))
			),
			() => {
				alert('The plug-in settings have been saved. Please update the app!');
				window.location.href = `../../flow?app=${kintone.app.getId()}`;
			}
		);
	};

	/*
	KintoneConfigHelper.getFields(["SINGLE_LINE_TEXT","LINK"])
	.then((resp) => {
		console.log(resp);
	})
	.catch((err) => {
		console.log(err);
	});
	*/
})(kintone.$PLUGIN_ID);
