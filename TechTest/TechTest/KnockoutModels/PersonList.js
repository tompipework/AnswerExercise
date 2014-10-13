function PersonList() {
    var self = this;

    self.people = ko.observableArray([]);

    self.getPeople = function () {
        self.people.removeAll();

        $.getJSON('/api/people', function (data) {
            $.each(data, function (key, value) {
                self.people.push(new Person(value));
            });
        });
    };
}

function yesNo(val) {
    return val ? "yes" : "no";
}

function Person(value) {
    var self = this;

    self.PersonId = value.PersonId;
    self.FirstName = value.FirstName;
    self.LastName = value.LastName;
    self.IsAuthorised = value.IsAuthorised;
    self.IsEnabled = value.IsEnabled;

    var colours = [];
    self.ColourIDs = ko.observableArray();
    $.each(value.Colours, function (key, v) {
        colours.push(v.Name);
        self.ColourIDs.push(v.ColourId + '');
    });
    self.ColourString = colours.join(", ");

    self.AuthorisedClass = ko.pureComputed(function() {
        return yesNo(self.IsAuthorised);
    }, self);

    self.EnabledClass = ko.pureComputed(function () {
        return yesNo(self.IsEnabled);
    }, self);

    self.PalindromeClass = ko.pureComputed(function () {
        return yesNo(isPalindrome(value.FirstName + value.LastName));
    }, self);

    function isPalindrome(word) {
        word = word.replace(" ", "").toLowerCase();
        return word == word.split('').reverse().join('');
    }

    self.FullName = ko.pureComputed(function () {
        return self.FirstName + " " + self.LastName;
    }, self);

    self.cancelChanges = function () {
        viewModel.showPeopleList();
    };

    self.saveChanges = function () {
        var json = ko.toJSON(this);

        delete json.AuthorisedClass;
        delete json.EnabledClass;
        delete json.FullName;

        $.ajax({
            url: '/api/people/' + this.PersonId,
            type: 'PUT',
            contentType: "application/json; charset=utf-8",
            data: json,
            success: function () {
                viewModel.showPeopleList();
            }
        });
    };

}