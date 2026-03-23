import json
import subprocess

def call(cmd, cwd=None):
    input(f"Will execute: [{cwd or '.'}]" + subprocess.list2cmdline(cmd))
    return subprocess.call(cmd, shell=True, cwd=cwd)

def check_i18n():
    with open("./src/locales/zh-Hans.json", "r", encoding="utf-8") as f:
        zh_hans = json.load(f)

    with open("./src/locales/zh-Hant.json", "r", encoding="utf-8") as f:
        zh_hant = json.load(f)
    
    with open("./src/locales/en.json", "r", encoding="utf-8") as f:
        en = json.load(f)

    for key in zh_hans:
        if key not in zh_hant:
            print(f"{key} in zh-Hans but not in zh-Hant")
            raise KeyError(key)
        if key not in en:
            print(f"{key} in zh-Hans but not in en")
            raise KeyError(key)
    


def bump():
    with open("./package.json", "r", encoding="utf-8") as f:
        package = json.load(f)

    with open("./node_modules/kipphi/package.json", "r", encoding="utf-8") as f:
        kipphi = json.load(f)

    with open("./node_modules/kipphi-player/package.json", "r", encoding="utf-8") as f:
        player = json.load(f)

    with open("./node_modules/kipphi-canvas-editor/package.json", "r", encoding="utf-8") as f:
        canvas_editor = json.load(f)

    with open("./src-tauri/tauri.conf.json", "r", encoding="utf-8") as f:
        tauri = json.load(f)

    print(f"当前版本: {package['version']}")
    print(f"kipphi版本: {kipphi['version']}")
    print(f"kipphi-player版本: {player['version']}")
    print(f"kipphi-canvas-editor版本: {canvas_editor['version']}")

    # Update package versions
    package["dependencies"]["kipphi"] = kipphi["version"]
    package["dependencies"]["kipphi-player"] = player["version"]
    package["dependencies"]["kipphi-canvas-editor"] = canvas_editor["version"]

    ver = input("请输入版本号，留空使用kipphi版本号: ")

    package["version"] = ver or kipphi["version"]
    tauri["version"] = ver or kipphi["version"]

    with open("./package.json", "w", encoding="utf-8") as f:
        json.dump(package, f, indent=4)
    
    with open("./src-tauri/tauri.conf.json", "w", encoding="utf-8") as f:
        json.dump(tauri, f, indent=4)

    print("发布到GitHub")
    call(["git", "add", "."])
    call(["git", "commit", "-m", "chore: Bump version to " + package["version"]])


    input("压缩提交到release分支")
    call(["git", "checkout", "release"])
    call(["git", "merge", "--squash", "master", "-m", "build: release " + package["version"]])

    input("推送到GitHub")
    call(["git", "push"])
    input("切换到master分支并推送")
    call(["git", "checkout", "master"])

    call(["git", "push"])
    
if __name__ == "__main__":
    check_i18n()
    bump()
    
    