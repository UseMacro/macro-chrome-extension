# Macro
Storing shortcuts

## Shortcut configuration file

All shortcut configuration files are stored within a JSON file. The naming
convention for all configuration files is `{domain-name}.json`. For example,
`example.com` is `example.com.json`. This is to ensure that there are no naming
collisions between configuration files.

### Configuration properties

`domain`: The domain name of the website in which the shortcuts apply.

`all-shortcuts`: An optional link that redirects the user to a list of all the
shortcuts for the domain.

`shortcuts`: A list of `section`s that contain OS-dependent shortcuts.

#### Shortcuts

```json
"section-name": [
  {
    "title": "Next message",
    "shortcut": <shortcut-value>
  }
]
```

Each object within the section should contain the following properties:

`title`: The name of the shortcut action.

`shortcut`: A <shortcut-value>. This can either be a list of shortcuts, or a
shortcut (global shortcut or OS-dependent shortcut).

**List of shortcuts**: This is a list of shortcut strings. Within a list, each 
value is either a **shortcut** or a **OS-dependent shortcut**. 

Example:
```
"Navigation": [{
  "title": "Move up",
  "shortcut": [
    "Up",
    "j",
    {
      "windows": "J",
      "macos": "Cmd+Up"
    }
  ]
}]
```

**Global shortcut (String)**: This is a string value with keys separated by a
`+`. At most one character key can be used, but multiple modifier keys can be used. This 
value is case sensitive. Modifier keys(Ctrl, alt, etc.) are not case
sensitive. For example:
```
"Shift+j" // Shift and capital j
"J" // Same as above
"Cmd+j" // Command and J
"Command+j" // Same as Cmd+j
"Command + j" // Same as Cmd+j, spaces are stripped
"j" // Click on the j key
"Comand+j" // Error, should be Command
"Command+J" // Warning triggered, this should be Command+Shift+j
```

**OS-dependent shortcut (Object)**: This is an object that contains three
values: 
- `windows`: The shortcut shown on a Windows machine.
- `macos`: The shortcut shown on a macOS machine.
- `linux` (optional): The shortcut shown on a Linux machine. Defaults to windows if not provided.

Example:
```
{
  "windows": "J",
  "macos": "Cmd+Up"
} // Linux shows J

{
  "windows": "J",
  "macos": "Cmd+Up",
  "linux": "Up"
}

{
  "macos": "Cmd+Up",
} // Error: windows is required
```
