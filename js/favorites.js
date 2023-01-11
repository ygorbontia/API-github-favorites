import { GithubProfile } from './GithubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)

    this.load()
  }

  async add(username) {
    try {
      const favoriteAlreadyAdd = this.entries.find(user => user.login === username)
      if (favoriteAlreadyAdd) {
        throw new Error('O usuário já foi adicionado')
      }

      const user = await GithubProfile.searchUser(username)
      if (user === undefined) {
        throw new Error('Usuário não encontrado, tente novamente')
      }

      this.entries = [user, ...this.entries]
      this.save()
      this.update()
    } catch (error) {
      alert(error.message)
    }
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => {
      return entry.login !== user.login
    })

    this.entries = filteredEntries
    this.update()
    this.save()
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.addGithubFavorite()
  }

  addGithubFavorite() {
    const githubUser = this.root.querySelector('.search input')
    const addFavoriteButton = this.root.querySelector('.search button')
    let value

    addFavoriteButton.onclick = () => {
      value = githubUser.value
      this.add(value)
      githubUser.value = ''
    }

    githubUser.onkeydown = (e) => {
      if (e.key == 'Enter') {
        value = githubUser.value
        this.add(value)
        githubUser.value = ''
      }
    }
  }

  update() {
    this.removeAllTr()
    this.checkTableEntries()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user a').href = `https://github.com/${ user.login }`
      row.querySelector('.user img').src = `https://github.com/${ user.login }.png`
      row.querySelector('.user img').alt = `Imagem de ${ user.name }`
      row.querySelector('.profile p').textContent = user.name
      row.querySelector('.profile span').textContent = `/${ user.login }`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove button').onclick = () => {
        const confirmDelete = confirm('Tem certeza que deseja remover este favorito?')

        if (confirmDelete) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  checkTableEntries() {
    if (this.entries.length == 0) {
      const row = this.createEmptyTableRow()

      this.tbody.append(row)
    }
  }

  createEmptyTableRow() {
    const tr = document.createElement('tr')
    tr.classList.add('empty-table')

    tr.innerHTML = `
      <td colspan="4">
        <div class="no-favorites">
          <img src="./assets/star-no-favorites.svg" alt="" />
          <p>Nenhum favorito ainda</p>
        </div>
      </td>
    `

    return tr
  }

  createRow() {
    const tr = document.createElement('tr')
    const content = `
      <td class="user">
        <a href="" target="_blank">
          <img src="" alt="" />
          <div class="profile">
            <p></p>
            <span></span>
          </div>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td class="remove">
        <button>Remover</button>
      </td>
    `

    tr.innerHTML = content

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove())
  }
}