Feature: Undo
  As a Data Packager
  I want to reverse the edit command(s) or data entry I just performed by mistake
  So that I can revert the data or metadata to a prior good state

  Rules:
    - Only Edit commands and Data Entry can be undone
    - Data entry in any panel can be undone when the panel is active
    - Undo only works within the scope of the current active panel back to when the panel was bought into focus
    - Edit commands can be undone until the last non-edit command only when the users is in the data table.
    - If the user is in side panel (i.e. not working on the table data) and invokes Undo, nothing should be undone in the data table.

  Background:
    Given I have opened Data Curator
    And I have performed a command that can be undone

  Scenario: Use the menu to undo a command
    When I select "Undo" from the menu
    Then reverse the previous data entry or edit command

  Scenario: Use a keyboard shortcut to undo a command
    When I use the Undo keyboard shortcut
    Then reverse the previous data entry or edit command
