var personListViewModell;

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

    self.Id = value.id;
    self.FirstName = value.FirstName;
    self.LastName = value.LastName;
    self.IsAuthorised = value.IsAuthorised;
    self.IsEnabled = value.IsEnabled;

    var colours = [];
    $.each(value.Colours, function (key, v) {
        colours.push(v.Name);
    });
    self.Colours = colours.join(", ");

    self.AuthorisedClass = ko.pureComputed(function() {
        return yesNo(self.IsAuthorised);
    }, self);

    self.EnabledClass = ko.pureComputed(function () {
        return yesNo(self.IsEnabled);
    }, self);

    self.FullName = ko.computed(function () {
        return self.FirstName + " " + self.LastName;
    }, self);
}

personListViewModel = new PersonList();

$(document).ready(function () {
    ko.applyBindings(personListViewModel);

    personListViewModel.getPeople();
});