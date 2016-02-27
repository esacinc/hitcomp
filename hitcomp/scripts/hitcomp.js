(function ($) {
    $(window).load(function () {
        var bodyElem = $("body"), navBarElem = $("nav.navbar", bodyElem), navBarHeaderElem = $("div.navbar-header", navBarElem),
            navBarBrandElem = $("a.navbar-brand", navBarHeaderElem), contentNavTabsElem = $("ul.navbar-nav.nav-tabs", navBarElem),
            contentNavTabLinkElems = $("li a", contentNavTabsElem), contentElem = $("div#content", bodyElem),
            contentTabsElem = $("div#content-tabs", contentElem), homeTabElem = $("div#content-home-tab", contentTabsElem),
            homeDataElem = $("div.content-data", homeTabElem), glossaryTableElem = $("table", homeDataElem);
        
        navBarBrandElem.attr("href", document.location.href.split("#", 2)[0]);
        
        $("div.content-tab:not(#content-home-tab) div.content-data table thead tr th", contentTabsElem).each(
            function (dataTableHeaderIndex, dataTableHeaderElem) {
            var glossaryTableRowElem = $(sprintf("tbody tr[data-field=\"%s\"]", (dataTableHeaderElem = $(dataTableHeaderElem)).attr("data-field")), 
                glossaryTableElem);
            
            if (glossaryTableRowElem.length > 0) {
                dataTableHeaderElem.attr("data-placement", "bottom").attr("data-toggle", "tooltip").tooltip({
                    "title": $.trim($("td:last span.content-text", glossaryTableRowElem).html())
                });
            }
        });
        
        glossaryTableElem.tablesorter($.extend({}, $.tablesorter.defaults, {
            "initialized": function () {
                homeDataElem.prev("div.content-loading").hide();
                homeDataElem.show();
            },
            "selectorHeaders": "> thead tr th:not(:last-of-type)",
            "sortList": [
                [ 0, 0 ]
            ],
            "textExtraction": function (glossaryDataElem) {
                return $("span.content-text", glossaryDataElem).text();
            }
        }));
        
        contentNavTabLinkElems.on("shown.bs.tab", function (event) {
            if (localStorage) {
                localStorage.setItem($.hitcomp.ui.CONTENT_TAB_ACTIVE_KEY, contentNavTabLinkElems.index(event.target));
            }
        });
        
        var contentNavTabActiveValue = 0;
        
        if (localStorage) {
            var contentNavTabActiveStrValue = localStorage.getItem($.hitcomp.ui.CONTENT_TAB_ACTIVE_KEY);
            
            contentNavTabActiveValue = (contentNavTabActiveStrValue ? (Number(contentNavTabActiveStrValue)) : contentNavTabActiveValue);
        }
        
        contentNavTabLinkElems.eq(contentNavTabActiveValue).tab("show");
        
        contentTabsElem.prev("div.content-loading").hide();
        contentTabsElem.show();
        
        var settingsModalElem = bodyElem.find("div#modal-settings"), settingsFormElem = settingsModalElem.find("form[name=\"settings-form\"]"),
            settingInputElems = settingsModalElem.find("input[type=\"text\"]"),
            compsSheetIdSettingInputElem = settingsModalElem.find("input#settings-data-comps-sheet-id"),
            compsSheetNameSettingInputElem = settingsModalElem.find("input#settings-data-comps-sheet-name"),
            rolesSheetIdSettingInputElem = settingsModalElem.find("input#settings-data-roles-sheet-id"),
            rolesSheetNameSettingInputElem = settingsModalElem.find("input#settings-data-roles-sheet-name"),
            settingSubmitButtonElem = settingsModalElem.find("button[type=\"submit\"]"),
            compsController = new $.hitcomp.CompetencyController(contentTabsElem.find("div#content-comps-tab")),
            rolesController = new $.hitcomp.RoleController(contentNavTabLinkElems, compsController, contentTabsElem.find("div#content-roles-tab"));
        
        settingsModalElem.on("show.bs.modal", function (event) {
            $.hitcomp.Settings.validate(compsSheetIdSettingInputElem, compsSheetNameSettingInputElem, rolesSheetIdSettingInputElem,
                rolesSheetNameSettingInputElem, settingSubmitButtonElem);
        });
        
        settingInputElems.focusin(function (event) {
            $(event.target).select();
        }).change(function (event) {
            var settingInputElem = $(event.target);
            
            if (settingInputElem.hasClass("form-control-settings-data-sheet-id")) {
                var sheetUrlSettingValueMatches = $.hitcomp.Settings.SHEET_URL_PATTERN.exec(settingInputElem.val());
                
                if (sheetUrlSettingValueMatches) {
                    settingInputElem.val(sheetUrlSettingValueMatches[1]);
                }
            }
            
            $.hitcomp.Settings.validate(compsSheetIdSettingInputElem, compsSheetNameSettingInputElem, rolesSheetIdSettingInputElem,
                rolesSheetNameSettingInputElem, settingSubmitButtonElem);
        });
        
        settingsFormElem.on("reset", function (event) {
            event.preventDefault();
            event.stopPropagation();
            
            var settings = settingsModalElem.data($.hitcomp.Settings.DATA_KEY);
            settings.reset();
            settings.save();
            
            compsSheetIdSettingInputElem.val(settings.compsSheetId);
            compsSheetNameSettingInputElem.val(settings.compsSheetName);
            rolesSheetIdSettingInputElem.val(settings.rolesSheetId);
            rolesSheetNameSettingInputElem.val(settings.rolesSheetName);
            
            $.hitcomp.Settings.validate(compsSheetIdSettingInputElem, compsSheetNameSettingInputElem, rolesSheetIdSettingInputElem,
                rolesSheetNameSettingInputElem, settingSubmitButtonElem);
        });
        
        settingsFormElem.submit(function (event) {
            event.preventDefault();
            event.stopPropagation();
            
            if (!$.hitcomp.Settings.validate(compsSheetIdSettingInputElem, compsSheetNameSettingInputElem, rolesSheetIdSettingInputElem,
                rolesSheetNameSettingInputElem, settingSubmitButtonElem)) {
                return;
            }
            
            var settings = settingsModalElem.data($.hitcomp.Settings.DATA_KEY);
            settings.compsSheetId = compsSheetIdSettingInputElem.val();
            settings.compsSheetName = compsSheetNameSettingInputElem.val();
            settings.rolesSheetId = rolesSheetIdSettingInputElem.val();
            settings.rolesSheetName = rolesSheetNameSettingInputElem.val();
            settings.save();
            
            if (localStorage) {
                localStorage.clear();
                
                settings.save();
            }
            
            document.location.reload(true);
        });
        
        $(document).on($.hitcomp.SETTINGS_LOADED_EVENT_NAME, $.proxy(function (event, settings) {
            settingsModalElem.data($.hitcomp.Settings.DATA_KEY, settings);
            
            compsSheetIdSettingInputElem.val(settings.compsSheetId);
            compsSheetNameSettingInputElem.val(settings.compsSheetName);
            rolesSheetIdSettingInputElem.val(settings.rolesSheetId);
            rolesSheetNameSettingInputElem.val(settings.rolesSheetName);
            
            navBarElem.find("button#btn-settings").removeAttr("disabled");
            
            $.hitcomp.Analytics.configure(settings.analyticsSiteId);
            
            var instructionsDocAlertElem = homeDataElem.find("div.alert#alert-instructions-doc");
            instructionsDocAlertElem.find("a").attr("href", settings.instructionsDocUrl);
            instructionsDocAlertElem.show();
            
            compsController.load(settings);
            
            rolesController.load(settings);
        }, this));
        
        $.hitcomp.Settings.load();
    });
}(jQuery));
